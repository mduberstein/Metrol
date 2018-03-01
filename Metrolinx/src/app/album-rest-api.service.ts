import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/RX';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';

import {Jsonp} from '@angular/http';
import {Http} from '@angular/http'
import {Response, Headers, RequestOptions} from '@angular/http';
import {Album} from './album.model'

@Injectable()
export class AlbumRestApiService {

  constructor(private http:Http, private jsonp:Jsonp ) {}

  getLocation(selectedCity:string): Observable<any[]>{
      let url = `https://www.metaweather.com/api/location/search/?query=${selectedCity}`;
      let observable1 = this.http.get(url);
      let observable2 = observable1.map((response:Response)=>{
        return response.json();
      });
      let observable3 = observable2.catch(this.handleError);
      return observable3;
    // return this.http.get(`https://www.metaweather.com/api/location/search/?query=${selectedCity}`)
    //   .map((response:Response)=> {
    //     return response.json();
    //   }).catch(this.handleError);
  }

// JSOP approach
//   getLocation(selectedCity:string): Observable<any[]>{
//     let url = `https://www.metaweather.com/api/location/search/?query=${selectedCity}&callback=JSON_CALLBACK`;
//     let headers = new Headers({'Accept':'application/javascript'} );
//     let options = new RequestOptions ({headers: headers});
//     let observable1 = this.jsonp.request(url, options);
//     var observable2 = observable1.map((response:Response)=>{
//       return response.json();
//     });
//     var observable3 = observable2.catch(this.handleError);
//     return observable3;
//   // return this.http.get(`https://www.metaweather.com/api/location/search/?query=${selectedCity}`)
//   //   .map((response:Response)=> {
//   //     return response.json();
//   //   }).catch(this.handleError);
// }

  getWeatherAndSunRiseSetDataSync(selectedCityWoeid:number):Observable<any>{
    return this.http.get(`https://www.metaweather.com/api/location/${selectedCityWoeid}`).map((response:Response)=>{return response.json();}).catch(this.handleError);
  }

  getWeatherAndSunRiseSetData(selectedCity:string):Observable<any>{
    let observableTarget = this.getLocation(selectedCity).mergeMap(
      (location)=>{
          let selectedCityWoeid = location[0].woeid;
          let url = `https://www.metaweather.com/api/location/${selectedCityWoeid}`;
          let observable1 = this.http.get(url);
          let observable2 = observable1.map((response:Response)=>{
            let weatherDataJson = response.json();
            return {woeid: selectedCityWoeid,
              sunRiseString: weatherDataJson.sun_rise,
              sunSetString: weatherDataJson.sun_set
            };
          });
          let observable3 = observable2.catch(this.handleError);
          return observable3;
      });
      return observableTarget;
  }

  getAlbums():Observable<Album[]>{
    let  url = 'http://musicbrainz.org/ws/2/recording?query=artist:%22Queen%22%20and%20type:%22album%22&fmt=json';
    return this.http.get(url).map((response:Response)=>{
      let data = response.json();
      let albums:Album[]=[];
      data.recordings.forEach((value, index)=>{
        albums.push(new Album(value.title, value.length, value.releases[0]['track-count']));
        if(isNaN(albums[index].trackLength)){
          console.log(`${albums[index].title}: length is missing`)
        }
        if(isNaN(albums[index].trackCount)){
          console.log(`${albums[index].title}: track-count is missing`)
        }

      });
      return albums;
    }).catch(this.handleError);
  }

  private handleError(error: Response) {
    return Observable.throw(error.status);
  }
}
