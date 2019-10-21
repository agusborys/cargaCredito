import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { AngularFirestore } from '@angular/fire/firestore';

export interface DatosUsuario {
  id: string;
  credito: number;
  email: string;
  codigosCargados: string;
}

@Injectable({
  providedIn: 'root'
})
export class CreditoService {

  private auxRetornoTotal = '';
  private datosUser: DatosUsuario = null;
  private emailActual: string = null;

  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore) { }

  public async InicializarServicio() {
    this.emailActual = this.authService.GetUser();

    await this.firestore.collection('creditos').ref.where('email', '==', this.emailActual).get().
      then((documento) => {
        this.datosUser = documento.docs[0].data() as DatosUsuario;
        this.datosUser.id = documento.docs[0].id;
      }).catch((err) => {
        // alert('Error en Init' + err);
      });
  }

  private CodigoValido(codigos: Array<string>, cod: string) {
    let auxReturn = true;
    for (const codigo of codigos) {
      if (codigo === cod) {
        // alert(codigo);
        auxReturn = false;
      }
    }

    return auxReturn;
  }

  private SumarCredito(codigo) {
    let auxReturn = -1;

    switch (codigo) {
      case '8c95def646b6127282ed50454b73240300dccabc': {
        auxReturn = 10;
        break;
      }
      case 'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172 ': {
        auxReturn = 50;
        break;
      }
      case '2786f4877b9091dcad7f35751bfcf5d5ea712b2f': {
        auxReturn = 100;
        break;
      }
      default: {
        auxReturn = -1;
        break;
      }
    }

    return auxReturn;
  }

  public async CargarCredito(codigo) {
    const auxCodigos: Array<string> = this.datosUser.codigosCargados === '' ?
      new Array<string>() : JSON.parse(this.datosUser.codigosCargados);
    // alert(auxCodigos);
    if (this.CodigoValido(auxCodigos, codigo)) {
      // alert('Añado el codigo');
      // alert(auxCodigos.length);
      const auxCarga = this.SumarCredito(codigo);
      if (auxCarga !== -1) {
        auxCodigos.push(codigo.toString());
        // alert(auxCodigos);
        this.datosUser.codigosCargados = JSON.stringify(auxCodigos);  
        this.datosUser.credito += auxCarga;
        this.auxRetornoTotal = 'Credito cargado ' + auxCarga;
        // alert('Voy a setear los codigos cargados');
        await this.firestore.collection('creditos').doc(this.datosUser.id).set({
          credito: this.datosUser.credito,
          email: this.datosUser.email,
          codigosCargados: this.datosUser.codigosCargados
        })
          .then(() => {
            // alert('Creditos seteados');
            this.auxRetornoTotal = 'Credito cargado ' + auxCarga;
            return this.auxRetornoTotal;
          })
          .catch(err => {
            // alert('Error en el set del credito' + err);
            this.auxRetornoTotal = 'Error en el set del credito' + err;
            return this.auxRetornoTotal;
          });

        return this.auxRetornoTotal;
      } else {
        this.auxRetornoTotal = 'El QR no es valido';
        return this.auxRetornoTotal;
      }

      return this.auxRetornoTotal;
    } else {
      // alert('El codigo ya fue cargado');
      this.auxRetornoTotal = 'El codigo ya fue cargado';
    }
    return this.auxRetornoTotal;
  }

  public ObtenerCredito() {
    return this.datosUser.credito;
  }

  public async ReiniciarCreditos() {
    this.datosUser.credito = 0;
    this.datosUser.codigosCargados = '';

    let returnAux = 'Borrado';
    // alert('Voy a setear los codigos cargados');
    await this.firestore.collection('creditos').doc(this.datosUser.id).set({
      credito: this.datosUser.credito,
      email: this.datosUser.email,
      codigosCargados: this.datosUser.codigosCargados
    })
      .then(() => {
        returnAux = 'Borrado';
      })
      .catch(err => {
        returnAux = 'Error';
      });

    return returnAux;
  }
}
