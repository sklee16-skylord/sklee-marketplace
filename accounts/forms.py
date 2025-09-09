from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser
import re

class CustomUserCreationForm(UserCreationForm):
    phone = forms.CharField(
        max_length=15,
        widget=forms.TextInput(attrs={'placeholder': 'Phone (e.g., 08012345678)'}),
        help_text='Enter your Nigerian phone number'
    )
    agree_rules = forms.BooleanField(required=True)

    class Meta:
        model = CustomUser
        fields = ('email', 'password1', 'password2', 'first_name', 'last_name', 'phone')

    def clean_phone(self):
        phone = self.cleaned_data.get('phone')
        if phone:
            # Remove any non-digit characters
            phone = re.sub(r'\D', '', phone)

            # Nigerian phone number validation
            if len(phone) == 11 and phone.startswith('0'):
                phone = '+234' + phone[1:]
            elif len(phone) == 10 and phone.startswith('0'):
                phone = '+234' + phone
            elif len(phone) == 13 and phone.startswith('234'):
                phone = '+' + phone

            if not (phone.startswith('+234') and len(phone) == 14):
                raise forms.ValidationError('Please enter a valid Nigerian phone number (e.g., 08012345678)')

            # Check if phone already exists (case-insensitive)
            if CustomUser.objects.filter(phone=phone).exists():
                raise forms.ValidationError('This phone number is already registered.')

        return phone

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if CustomUser.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError('This email is already registered.')
        return email

    def clean(self):
        cleaned_data = super().clean()
        return cleaned_data