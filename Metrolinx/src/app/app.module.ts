import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms'
import {HttpModule} from '@angular/http'
import {JsonpModule} from '@angular/http'

import { AppComponent } from './app.component';
import { AlbumListComponent } from './album-list/album-list.component';
import {AlbumRestApiService} from './album-rest-api.service'


@NgModule({
  declarations: [
    AppComponent,
    AlbumListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    JsonpModule
  ],
  providers: [AlbumRestApiService],
  // bootstrap: [AppComponent]
  bootstrap: [AlbumListComponent]
})
export class AppModule { }
