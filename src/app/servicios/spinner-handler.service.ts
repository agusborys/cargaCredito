import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SpinnerHandlerService {

  constructor(private loadingCtrl:LoadingController) { }

  public async GetAllPageSpinner(messageSpinner) {
    const loader = await this.loadingCtrl.create({
      spinner: null,
      keyboardClose: true,
      message: '<div class="lds-hourglass"></div>'+messageSpinner,
      showBackdrop: false,
      duration:2000,
      cssClass: 'spinner'
    });

    return loader;
  }
}
