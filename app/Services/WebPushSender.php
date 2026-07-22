<?php

namespace App\Services;

use App\Models\User;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class WebPushSender
{
    private ?WebPush $client = null;

    private function client(): ?WebPush
    {
        if (! config('services.webpush.public_key') || ! config('services.webpush.private_key')) {
            return null;
        }

        return $this->client ??= new WebPush([
            'VAPID' => [
                'subject' => config('services.webpush.subject'),
                'publicKey' => config('services.webpush.public_key'),
                'privateKey' => config('services.webpush.private_key'),
            ],
        ]);
    }

    /**
     * Send a notification to all of a user's push subscriptions. Prunes
     * subscriptions the push service reports as gone (410/404).
     */
    public function send(User $user, string $title, string $body, ?string $url = null): void
    {
        $client = $this->client();
        if (! $client) {
            return;
        }

        $subscriptions = $user->pushSubscriptions()->get();
        if ($subscriptions->isEmpty()) {
            return;
        }

        $payload = json_encode(['title' => $title, 'body' => $body, 'url' => $url ?? '/dashboard']);

        $byEndpoint = $subscriptions->keyBy('endpoint');

        foreach ($subscriptions as $sub) {
            $client->queueNotification(
                Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'publicKey' => $sub->public_key,
                    'authToken' => $sub->auth_token,
                ]),
                $payload,
            );
        }

        foreach ($client->flush() as $report) {
            $endpoint = $report->getRequest()->getUri()->__toString();
            if (! $report->isSuccess() && $report->isSubscriptionExpired()) {
                $byEndpoint->get($endpoint)?->delete();
            }
        }
    }
}
