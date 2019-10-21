import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/servicios/auth.service';
import { Router } from '@angular/router';
import { ErrorHandlerService } from 'src/app/servicios/error-handler.service';
import { SpinnerHandlerService } from 'src/app/servicios/spinner-handler.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {


  constructor(private alertCtrl: AlertController,
    private auth:AuthService,
    private router:Router,
    private errorHandler:ErrorHandlerService,
    private spinnerHand: SpinnerHandlerService) { }
  private spinner: any = null;
  usuarioSeleccionado: string;
  email:string;
  password:string;
  testRadioResult;
  arrayUsuarios : Array <any> = [
    {id:1,nombre:"admin@gmail.com",clave:111111,perfil:"admin",sexo:"Female"},
    {id:2,nombre:"invitado@gmail.com",clave:222222,perfil:"invitado",sexo:"Female"},
    {id:3,nombre:"usuario@gmail.com",clave:333333,perfil:"usuario",sexo:"Male"},
    {id:4,nombre:"anonimo@gmail.com",clave:444444,perfil:"usuario",sexo:"Male"},
    {id:5,nombre:"tester@gmail.com",clave:555555,perfil:"tester",sexo:"Female"}
  ];

  ngOnInit() {
  }
  public async Login()
  {
    if(this.ValidForm())
    {
      // Obtener Spiner
      this.spinner = await this.spinnerHand.GetAllPageSpinner('Cargando.');
      // Mostrar Spiner
      this.spinner.present();
      this.auth.SignIn(this.email, this.password).then(()=>{
        this.spinner.dismiss();
        this.router.navigate(['/inicio']);
        this.email="";
        this.password="";
      })
      .catch(err=>{
        this.spinner.dismiss();
        this.errorHandler.mostrarError(err,"Error al iniciar sesión");
      });
    }
    // this.auth.login(this.email, this.password).then( res=>{
    //   this.router.navigate(['/inicio']);
    // }).catch(err=>{
    //   this.errorHandler.mostrarError(err, "Error al iniciar sesión");
    // });
  }
  private ValidForm() {
    let auxReturn: boolean = false;
    if (this.email && this.password) {
      auxReturn = true;
    } else {
      // Mostrar Toast con mensaje
      this.errorHandler.mostrarErrorSolo("Debe completar todos los campos");
    }
    return auxReturn;
  }

  
  async abrirAlert()
  {
    const alert = await this.alertCtrl.create({
      cssClass: 'seleccionarAlert',
      header: 'Seleccionar usuario',
      inputs: [
        {
          type: 'radio',
          label: 'Administrador',
          value: 'admin',
          checked: true
        },
        {
          type: 'radio',
          label: 'Invitado',
          value: 'invitado'
        },
        {
          type: 'radio',
          label: 'Usuario',
          value: 'usuario'
        },
        {
          type: 'radio',
          label: 'Anónimo',
          value: 'anonimo'
        },
        {
          type: 'radio',
          label: 'Tester',
          value: 'tester'
        }
      ],
      buttons:[
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            console.log('Confirm Ok');
            this.testRadioResult = data;
            this.usuarioSeleccionado = data;
            this.seleccionarUsuario();
          }
        }
      ]
    });
    await alert.present();
  }
  seleccionarUsuario()
  {
    switch(this.usuarioSeleccionado){
      case "admin":{
        this.email="admin@admin.com";
        this.password="111111";
        break;
      }
      case "invitado":{
        this.email="invitado@invitado.com";
        this.password="222222";
        break;
      }
      case "usuario":{
        this.email="usuario@usuario.com";
        this.password="333333";
        break;
      }                
      case "anonimo":{
        this.email="anonimo@anonimo.com";
        this.password="44";
        break;
      }
      case "tester" :{
        this.email="tester@tester.com";
        this.password="55";
        break;
      }        
    }
  }

}
