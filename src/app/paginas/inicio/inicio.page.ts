import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/servicios/auth.service';
import { NavController, Platform, AlertController } from '@ionic/angular';
import { ErrorHandlerService } from 'src/app/servicios/error-handler.service';
import { ZBar, ZBarOptions } from '@ionic-native/zbar/ngx';
import { CreditoService } from 'src/app/servicios/credito.service';
import { SpinnerHandlerService } from 'src/app/servicios/spinner-handler.service';
import { timer } from 'rxjs/internal/observable/timer';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

  public creditoActual: number = null;
  private zbarOptions: any;
  public email = null;
  private spinner:any = null;
  
  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    public errorHand: ErrorHandlerService,
    public plt: Platform,
    private zbar: ZBar,
    private creService: CreditoService,
    private spinnerHand:SpinnerHandlerService,
    private alertCtrl: AlertController
  ) {}

  public async ngOnInit() {
    

    this.spinner = await this.spinnerHand.GetAllPageSpinner('Cargando datos.');
    this.spinner.present();

    await this.creService.InicializarServicio().then(() => {
      this.email = this.authService.GetUser();
      this.creditoActual = this.creService.ObtenerCredito();
      this.spinner.dismiss();
    })
      .catch((err) => {
        this.spinner.dismiss();
      });
  }
  //cargar datos
  public async ionViewDidEnter() {
    this.email = this.authService.GetUser();
    this.creditoActual = this.creService.ObtenerCredito();
  }
  //Cerrar sesión
  public async LogOut() {
    const alert = await this.alertCtrl.create({
      cssClass: 'avisoAlert',
      header:'¿Desea cerrar sesión?',
      buttons:[{
        text: 'Cancelar',
        role: 'cancel',
        handler: () => {
          console.log('Confirm Cancel');
        }
      },
    {
      text:'Ok',
      handler: async () => {
        this.spinner = await this.spinnerHand.GetAllPageSpinner('Cerrando sesión.');
        this.spinner.present();

        timer(2000).subscribe(()=>{
          this.authService.LogOut().then(() => {
          this.navCtrl.navigateRoot('login', { replaceUrl: true });
          this.email = null;
          this.creditoActual = null;
          }).catch(error => {
            this.errorHand.mostrarError(error);
          }).finally(() => {
            //timer(2000).subscribe(()=>this.spinner.dismiss());
            
          });
        });
      }
    }]
    });
    await alert.present();
    
    
  }
  public async ScanQRCode() {
    //this.errorHand.mostrarErrorSolo('Estoy escaneando codigo');
    this.spinner = await this.spinnerHand.GetAllPageSpinner('Procesando');
    this.spinner.present();
    let options : ZBarOptions = {
      flash: 'off',
      drawSight: true,
      text_title: 'Escanea el codigo QR',
      text_instructions:'Por favor apunta con tu cámara al codigo QR'
    };
    this.zbar.scan(options)
      .then((result) => {
        // this.errorHand.MostrarErrorSoloLower(result);
        // alert(result); // Scanned code
        this.creService.CargarCredito(result).then((data) => {
          // alert('Data de la funcion' + data);
          let mensaje = null;

          if (data) {
            mensaje = data;
          } else {
            mensaje = 'Error';
          }

          // this.PresentModal(mensaje);
          this.errorHand.mostrarErrorSolo(mensaje);
          this.creditoActual = this.creService.ObtenerCredito();
          this.spinner.dismiss();
        });
      })
      .catch(error => {
        if (error === 'cancelled') {
          this.errorHand.mostrarErrorSolo('Cancelado.');
        } else {
          this.errorHand.mostrarError(error);
        }
        this.spinner.dismiss();
        // alert(error); // Error message
      });
  }
  public async ReiniciarCodigos() {
    this.spinner = await this.spinnerHand.GetAllPageSpinner('Reiniciando códigos...');
    this.spinner.present();
    
    await this.creService.ReiniciarCreditos()
      .then(() => {
        this.creditoActual = this.creService.ObtenerCredito();
        this.spinner.dismiss();
      })
      .catch(() => {
        this.spinner.dismiss();
      });
  }

}
