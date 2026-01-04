import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';


import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css'
})
export class OnboardingComponent {

  success = false;
  error = false;
  message = '';

  investorTypes = [
    'Resident Individual',
    'HUF',
    'Body Corporate',
    'Trust',
    'NRI',
    'Partnership Firm'
  ];
  

  form: any;

  


 


 
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      investorType: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      pan: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
        ]
      ],
      email: ['', [Validators.required, Validators.email]],
      mobile: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[6-9][0-9]{9}$/)
        ]
      ],
      plan: ['', Validators.required],
      amount: [
        '',
        [
          Validators.required,
          Validators.min(5000000) // ₹50 Lakhs
        ]
      ],
      horizon: ['', Validators.required]
    });
  }

  
  investmentHorizons = ['1–3 Years', '3–5 Years', '5+ Years'];
  riskProfiles = ['Conservative', 'Moderate', 'Aggressive'];
  


  submit() {
    this.success = false;
    this.error = false;
    this.message = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.error('Please fix validation errors', 'Invalid Form');
      this.error = true;
      this.message = 'Please fill all required fields';
      return;
    }

    // Save to sessionStorage (POC requirement)
    sessionStorage.setItem(
      'stallion_onboarding',
      JSON.stringify(this.form.value)
    );

    const API_BASE_URL = 'https://stallion-poc-backend.vercel.app';

    // Call backend validation API
    this.http.post<any>(`${API_BASE_URL}/submit`, this.form.value)
      .subscribe({
        next: (res) => {
          this.success = true;
          this.message = res.message;
          this.toastr.success(
            'Your application has been submitted successfully',
            'Submitted'
          );
          this.form.reset();

        },
        error: (err) => {
          this.error = true;
          this.message = err.error?.message || 'Submission failed';
          this.form.reset();

        }
      });
  }
  get f() {
    return this.form.controls;
  }

  savedLead: any = null;

scrollToLeads() {
  const data = sessionStorage.getItem('stallion_onboarding');
  if (data) {
    this.savedLead = JSON.parse(data);
    setTimeout(() => {
      document.getElementById('leadsSection')?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 100);
  } else {
    this.toastr.info('No saved leads found', 'Info');
  }
}


chatbotOpen = false;
chatbotAnswer = '';

toggleChatbot() {
  this.chatbotOpen = !this.chatbotOpen;
}

selectQuestion(type: string) {
  const answers: any = {
    minInvestment:
      'The minimum investment amount for Stallion PMS is ₹50,00,000 as per SEBI regulations.',

    plans:
      'Plan A charges 1.5% fixed fee with 15% profit sharing, while Plan B charges a flat 2.5% with no profit sharing.',

    timeline:
      'Onboarding usually takes 1–2 working days after successful document verification.',

    sebi:
      'Yes. Stallion Asset is a SEBI-registered Portfolio Management Service (INP000006129).'
  };

  this.chatbotAnswer = answers[type];
}



}
