import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { FormsModule } from '@angular/forms';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ], templateUrl: './onboarding.component.html',
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

    const API_BASE_URL = 'https://stallion-backend-poc.vercel.app';

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
  userMessage = '';
  loading = false;


  toggleChatbot() {
    this.chatbotOpen = !this.chatbotOpen;
  }

  /** Send message to backend */
  askBot(message: string) {
    if (!message?.trim()) return;

    this.loading = true;
    this.chatbotAnswer = '';
    this.userMessage = '';

    const API_BASE_URL = 'https://stallion-backend-poc.vercel.app';

    this.http.post<any>(`${API_BASE_URL}/chat`, {
      message
    }).subscribe({
      next: (res) => {
        this.loading = false;

        if (res.action === 'REDIRECT') {
          window.location.href = res.url;
          return;
        }

        this.chatbotAnswer = res.reply || 'Sorry, I could not understand.';
      },
      error: () => {
        this.loading = false;
        this.chatbotAnswer = 'Something went wrong. Please try again.';
      }
    });
  }

  /** Quick questions */
  selectQuestion(type: string) {
    const questions: any = {
      minInvestment: 'What is the minimum investment for PMS?',
      plans: 'What is the difference between Plan A and Plan B?',
      timeline: 'How long does onboarding take?',
      sebi: 'Is Stallion Asset SEBI registered?',
      performance: 'Performance summary'
    };

    this.askBot(questions[type]);
  }

  /** User typed question */
  sendUserMessage() {
    this.askBot(this.userMessage);
  }



}
