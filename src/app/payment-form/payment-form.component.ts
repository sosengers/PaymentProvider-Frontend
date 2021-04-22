import {Component, OnInit} from '@angular/core';
import {PaymentService} from '../payment.service';
import {ActivatedRoute} from '@angular/router';
import {PaymentRequest} from '../interfaces/payment-request';
import {PaymentData} from '../interfaces/payment-data';
import {FormGroup, FormControl, Validators} from '@angular/forms';

@Component({
    selector: 'app-payment-form',
    templateUrl: './payment-form.component.html',
    styleUrls: ['./payment-form.component.css'],
})
export class PaymentFormComponent implements OnInit {

    paymentData!: PaymentRequest;
    paymentPage = false;
    // tslint:disable-next-line:variable-name
    transaction_id = '';
    // tslint:disable-next-line:variable-name
    successfull_payment = 0; // 0=ancora da pagare, 1=tutto ok, 2=in attesa di risposta, 3+=errore
    minDate: Date;

    paymentForm = new FormGroup({
        customer_name: new FormControl('', [Validators.required]),
        card_number: new FormControl('', [Validators.required, Validators.minLength(16), Validators.pattern('[0-9]*')]),
        cvv: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(3), Validators.pattern('[0-9]*')]),
        expiration_date: new FormControl('', [Validators.required]),
    });

    constructor(private paymentService: PaymentService,
                private route: ActivatedRoute) {
        this.minDate = new Date();
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            if ('transaction_id' in params) {
                this.transaction_id = params.transaction_id;
                this.paymentPage = true;
                this.paymentService.getPaymentDetail(params.transaction_id).subscribe(paymentData => {
                    console.log(paymentData);
                    this.paymentData = paymentData;
                });
            } else {
                this.paymentPage = false;
            }
        });
    }

    onSubmit(): void {
        // Create the structure to send to the Payment Provider Backend
        const paymentInformation = {
            transaction_id: this.transaction_id,
            credit_cart_number: this.paymentForm.value.card_number,
            owner_name: this.paymentForm.value.customer_name,
            cvv: this.paymentForm.value.cvv,
            expiration_date: this.paymentForm.value.expiration_date
        } as PaymentData;

        console.log(paymentInformation);

        this.successfull_payment = 2;

        // Send the data to the PaymentProvider Backedn
        this.paymentService.postPayment(paymentInformation).subscribe(
            (response) => {
                console.log(response);
                this.successfull_payment = 1;
            },
            (error) => {
                console.log(error);
                this.successfull_payment = 3;
            }
        );
    }

    /*
    Checks to perform to the form
     */
    getCustomerNameErrorMessage(): string {
        const customer_name = this.paymentForm.controls.customer_name;

        if (customer_name.hasError('required')) {
            return 'Devi inserire un valore';
        }

        return this.paymentForm.controls.customer_name.hasError('customer_name') ? 'Errore' : '';
    }

    getCardNumberErrorMessage(): string {
        const card_number = this.paymentForm.controls.card_number;

        return card_number.hasError('credit_cart_number') ? 'Numero carta di credito non valido' : 'Numero carta di credito non valido';
    }

    getCvvErrorMessage(): string {
        const cvv = this.paymentForm.controls.cvv;

        if (cvv.hasError('minlength') || cvv.hasError('maxlength')) {
            return 'Il codice di sicurezza deve essere di 3 cifre';
        }

        return this.paymentForm.controls.cvv.hasError('cvv') ? 'Codice di sicurezza no valido' : 'Codice di sicurezza non valido';
    }

    getExpirationDateErrorMessage(): string {
        const expiration_date = this.paymentForm.controls.expiration_date;
        return expiration_date.hasError('expiration_date') ? 'Formato data errato' : 'Formato data errato';
    }

    closeDatePicker(eventData: any, dp?: any): void {
        // get month and year from eventData and close datepicker, thus not allowing user to select date
        this.paymentForm.controls.expiration_date.setValue(eventData);
        dp.close();
    }
}
