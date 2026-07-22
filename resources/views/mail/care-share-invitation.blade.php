<x-mail::message>
# {{ $patientName }} shared their health record with you

On **{{ config('app.name') }}**, **{{ $patientName }}** has given you
{{ $label ? '(' . $label . ') ' : '' }}**read-only** access to their kidney
health record — labs, medications, diet & fluid, symptoms and dialysis.

@if ($hasAccount)
Sign in and open **Shared with me** to view their data.
@else
Create a free account with **this email address**, then open **Shared with me**
to view their data.
@endif

<x-mail::button :url="$actionUrl">
{{ $hasAccount ? 'Open Shared with me' : 'Create your account' }}
</x-mail::button>

You can only view — you can't change anything. The patient can remove access at
any time.

Thanks,<br>
{{ config('app.name') }}

<x-slot:subcopy>
If you weren't expecting this, you can ignore this email.
</x-slot:subcopy>
</x-mail::message>
