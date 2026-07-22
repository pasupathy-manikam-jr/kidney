<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CareShareInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $patientName,
        public ?string $label,
        public bool $hasAccount,
        public string $actionUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: config('app.name').': '.$this->patientName.' shared their health record with you',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.care-share-invitation',
        );
    }
}
