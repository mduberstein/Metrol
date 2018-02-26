import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/RX'
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch'

import {Http, Response, Headers, RequestOptions} from '@angular/http';

@Injectable()
export class AlbumRestApiService {

  constructor(private http:Http) {}

  getLocation(selectedCity:string): Observable<any[]>{
      let url = `https://www.metaweather.com/api/location/search/?query=${selectedCity}`;
      let observable1 = this.http.get(url);
      var observable2 = observable1.map((response:Response)=>{
        return response.json();
      });
      var observable3 = observable2.catch(this.handleError);
      return observable3;
    // return this.http.get(`https://www.metaweather.com/api/location/search/?query=${selectedCity}`)
    //   .map((response:Response)=> {
    //     return response.json();
    //   }).catch(this.handleError);
  }

  getWeatherAndSunRiseSetData(selectedCityWoeid:number):Observable<any>{
    return this.http.get(`https://www.metaweather.com/api/location/${selectedCityWoeid}`).map((response:Response)=>{return response.json();}).catch(this.handleError);
  }

  private handleError(error: Response) {
    return Observable.throw(error.status);
  }
}
