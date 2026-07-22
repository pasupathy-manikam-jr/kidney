<?php

namespace App\Console\Commands;

use App\Models\Medication;
use App\Models\User;
use App\Services\WebPushSender;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SendReminders extends Command
{
    protected $signature = 'reminders:send';

    protected $description = 'Send due medication, transfer-set and appointment push reminders';

    public function handle(WebPushSender $push): int
    {
        // Reminder times are wall-clock in each user's timezone, so evaluate
        // everything per-user in their local time.
        Medication::query()
            ->where('active', true)
            ->whereNotNull('reminder_time')
            ->with('user')
            ->get()
            ->each(function (Medication $med) use ($push) {
                if (! $med->user) {
                    return;
                }
                $localHhmm = now($med->user->timezone ?: 'UTC')->format('H:i');
                if ($med->reminder_time !== $localHhmm) {
                    return;
                }
                $body = $med->dosage ? "{$med->name} · {$med->dosage}" : $med->name;
                $push->send($med->user, 'Medication reminder', $body, '/medications');
                $this->line("Med reminder: {$med->user->email} - {$med->name}");
            });

        // Daily digest at 08:00 local time: transfer-set due & appointments today.
        User::query()->chunk(100, function ($users) use ($push) {
            foreach ($users as $user) {
                $local = now($user->timezone ?: 'UTC');
                if ($local->format('H:i') !== '08:00') {
                    continue;
                }
                $today = $local->toDateString();

                $catheter = $user->catheters()->latest('id')->first();
                $next = $catheter?->nextTransferSetChange();
                if ($next) {
                    $days = (int) Carbon::parse($today)->diffInDays($next, false);
                    if ($days <= 7 && $days >= 0) {
                        $push->send($user, 'Transfer set change', "Due in {$days} day(s) ({$next->toDateString()}).", '/dialysis');
                    } elseif ($days < 0) {
                        $push->send($user, 'Transfer set change', 'This is overdue — contact your care team.', '/dialysis');
                    }
                }

                $appt = $user->appointments()->whereDate('scheduled_for', $today)->first();
                if ($appt) {
                    $time = $appt->time_of_day ? " at {$appt->time_of_day}" : '';
                    $push->send($user, 'Appointment today', "{$appt->title}{$time}.", '/appointments');
                }
            }
        });

        return self::SUCCESS;
    }
}
