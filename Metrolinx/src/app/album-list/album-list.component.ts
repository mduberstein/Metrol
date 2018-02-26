import { Component, OnInit, Input } from '@angular/core';
import {AlbumRestApiService} from '../album-rest-api.service';

@Component({
  selector: 'app-album-list',
  templateUrl: './album-list.component.html',
  styleUrls: ['./album-list.component.css']
})
export class AlbumListComponent implements OnInit {
  readonly selectACity:string = "Select a City";
  readonly cityObjects: {id:number, name:string}[]  = [
    {id:-1, name: "Select City"},
    {id:0, name: "Toronto"},
    {id:1, name: "Tokyo"},
    {id:2, name: "London"},
    {id:3, name: "Sydney"}
  ];
  readonly cities: string[] = [
    this.selectACity,"Toronto", "Tokyo", "London", "Sydney"
  ];

  selectedCityObject:{id:number, name:string};
  selectedCity:string = "Not Selected";
  selectedCityWoeid:number = 0;
  sunRise:Date;
  sunSet:Date;
  sunRiseString:string = "Not Fetched";
  sunSetString:string = "Not Fetched";


  constructor(public albumRestApi:AlbumRestApiService) {
    this.selectedCityObject = {id:-1, name:""};
    this.selectedCity = this.selectACity;
  }

  ngOnInit() {
  }

  onSelect(city){
    this.selectedCityObject = city;
  }

  onClickButton(){
    alert("button clicked");
  }

  onCitySelected(){
    this.getCityWoeid();
    //this.getSunRiseSet();
  }

  private getCityWoeid(){
    let observable = this.albumRestApi.getLocation(this.selectedCity);
    let that = this;
    let subscription = observable.subscribe({
      next:(location) => {
        let woeid = location[0].woeid;
        console.log(`Selected City woeid: ${woeid}`);
        that.selectedCityWoeid = location[0].woeid},
      error: (err) => {
        console.error(err)
      }
    }
  );
  }

  private getSunRiseSet(){
    this.albumRestApi.getWeatherAndSunRiseSetData(this.selectedCityWoeid).subscribe(weatherData=>{
      this.sunRiseString = weatherData.sun_rise;
      this.sunSetString = weatherData.sun_set;
      this.sunRise = new Date(this.sunRiseString);
      this.sunSet = new Date(this.sunSetString);
    });
  }

}
