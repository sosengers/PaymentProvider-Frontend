import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentRequest } from './interfaces/payment-request';
import { PaymentData } from './interfaces/payment-data';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  
  paymentProviderBackendURL: string = "http://0.0.0.0:4001"

  constructor(private http: HttpClient) { }

  getPaymentDetail(transaction_id: string): Observable<PaymentRequest>{
    return this.http.get<PaymentRequest>(`${this.paymentProviderBackendURL}/payments/${transaction_id}`);
  }

  postPayment(paymentData: PaymentData) {
    return this.http.post(`${this.paymentProviderBackendURL}/payments/pay`, paymentData, {observe: 'response'})
  }
}
