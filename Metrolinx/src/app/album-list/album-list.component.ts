import { Component, OnInit, Input } from '@angular/core';
import {AlbumRestApiService} from '../album-rest-api.service';
import {Album} from '../album.model'

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
  albums:Album[]=[];
  albumsWithoutDuration:Album[]=[];
  albumsBeyondPlayTime:Album[]=[];
  playtimeTotalMsec:number;


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
    //alert("button clicked");
    let that = this;
    this.albumRestApi.getAlbums().subscribe({
      next:(albums)=>{
        that.albums=[];
        that.albumsWithoutDuration=[];
        let timeAvailableMsec:number = that.sunSet.getTime() - that.sunRise.getTime();
        that.playtimeTotalMsec = 0;
        for(let album of albums){
          if(isNaN(album.durationMsec)){
            that.albumsWithoutDuration.push(album);
            continue;
          }
          that.playtimeTotalMsec += album.durationMsec;
          if(that.playtimeTotalMsec > timeAvailableMsec){
            that.albumsBeyondPlayTime.push(album);
          }
          else{
            that.albums.push(album);
          }
        }
      },
      error: (err) => {
        console.error(err)
      }
    });
  }

  onCitySelected(){
    //this.getCityWoeid();
    this.getSunRiseSet();
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


  private getSunRiseSetSync(){
    this.albumRestApi.getWeatherAndSunRiseSetDataSync(this.selectedCityWoeid).subscribe(
      {next: (weatherData)=>{
        this.sunRiseString = weatherData.sun_rise;
        this.sunSetString = weatherData.sun_set;
        this.sunRise = new Date(this.sunRiseString);
        this.sunSet = new Date(this.sunSetString);
        },
      error: (err) =>{
        console.error(err);
      }
    });
  }

  private getSunRiseSet(){
    let that = this;
    this.albumRestApi.getWeatherAndSunRiseSetData(this.selectedCity).subscribe({
      next: (data)=>{
        that.selectedCityWoeid = data.woeid;
        that.sunRiseString = data.sunRiseString;
        that.sunSetString = data.sunSetString;
        that.sunRise = new Date(that.sunRiseString);
        that.sunSet = new Date(that.sunSetString);
      },
      error: (err) =>{
        console.error(err);
      }

    });
  }

}
