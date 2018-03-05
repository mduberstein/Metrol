import { Component, OnInit, Input } from '@angular/core';
import {AlbumRestApiService} from '../album-rest-api.service';
import {IAlbum, Album} from '../album.model'

@Component({
  selector: 'app-album-list',
  templateUrl: './album-list.component.html',
  styleUrls: ['./album-list.component.css']
})
export class AlbumListComponent implements OnInit {
  readonly selectACity:string = "Select a city";

  readonly cities: string[] = [
    this.selectACity,"Toronto", "Tokyo", "London", "Sydney"
  ];

  selectedCity:string;
  previouslySelectedCity:string;
  selectedCityWoeid:number;
  sunRise:Date;
  sunSet:Date;
  sunRiseString:string;
  sunSetString:string;
  albums:Album[]=[];
  albumsWithoutDuration:Album[]=[];
  albumsBeyondPlayTime:Album[]=[];
  playtimeTotalMsec:number = null;
  timeAvailableMsec:number = null;
  sunRiseSetTimesFetched:boolean = false;


  constructor(public albumRestApi:AlbumRestApiService) {
    this.selectedCity = this.selectACity;
    this.previouslySelectedCity = this.selectedCity;
    //Experiments
    // this.selectedCityObject = {id:-1, name:""};
  }

  //private readonly timeOptions = {hour: "2-digit", minute: "2-digit"};

  get formattedSunRiseTime():string {
    //'en-US' is not good for Tokyo, Sydney - tested
    //return this.sunRise ? this.sunRise.toLocaleTimeString('en-US', this.timeOptions):'';
    return this.sunRiseString ? this.sunRiseString.substr(11, 5) : null;
  }
  get formattedSunSetTime():string {
    //return this.sunSet ?  this.sunSet.toLocaleTimeString('en-US', this.timeOptions):'' ;
    return this.sunSetString ? this.sunSetString.substr(11, 5) : null;
  }

  get formattedPlaytimeTotal():string{
    return this.convertMsecTohhmm(this.playtimeTotalMsec);
  }
  get formattedTimeAvailable():string{
    return this.convertMsecTohhmm(this.timeAvailableMsec);
  }
  private convertMsecTohhmm(msec: number):string{
      if(isNaN(msec)){
        return 'unknown';
      }
      let hours:number = Math.floor(msec / 1000 / 3600);
      let minutes:string = Math.round((msec - hours * 3600 * 1000) / 60000).toFixed(0);
    return `${(hours >=10 ? hours.toString(10) : '0'.concat(hours.toString(10)))}:${minutes}`;
  }

  getAlbumDurationInMinutesAsStringTwoDecimals(album:Album):string{
    return this.convertMsecTommWithTwoDecimals(album.durationMsec);
  }

  private convertMsecTommWithTwoDecimals(msec: number):string{
    if(isNaN(msec)){
      return 'unknown';
    }
    let minutes:string = (msec/60000).toFixed(2);
    return minutes;
  }


  ngOnInit() {
  }

  onClickButton(){
    let that = this;
    this.albumRestApi.getAlbums().subscribe({
      next:(albums)=>{
        albums.sort(this.compareAlbums);
        that.albums=[];
        that.albumsWithoutDuration=[];
        that.playtimeTotalMsec = 0;
        for(let album of albums){
          if(isNaN(album.durationMsec)){
            that.albumsWithoutDuration.push(album);
            continue;
          }
          if(that.playtimeTotalMsec + album.durationMsec <= that.timeAvailableMsec){
            that.albums.push(album);
            that.playtimeTotalMsec += album.durationMsec;
          }
          else{
            that.albumsBeyondPlayTime.push(album);
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
    if(this.previouslySelectedCity !== this.selectedCity){
      this.previouslySelectedCity = this.selectedCity;
      this.selectedCityWoeid = null;
      this.sunRise = null;
      this.sunSet = null;
      this.sunRiseString = null;
      this.sunSetString = null;
      this.albums = [];
      this.albumsBeyondPlayTime = [];
      this.albumsWithoutDuration = [];
      this.playtimeTotalMsec = null;
      this.timeAvailableMsec = null;
      this.sunRiseSetTimesFetched = false;
      if(this.selectACity !== this.selectedCity){
        this.getSunRiseSet();
      }
    }
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
        that.timeAvailableMsec = that.sunSet.getTime() - that.sunRise.getTime();
      },
      error: (err) =>{
        console.error(err);
      },
      complete: ()=> {
        this.sunRiseSetTimesFetched = true;
        console.log(`${this.selectedCity}: sunrise and sunset times fetched`);
      }

    });
  }

  /**
   * album1.trackCount > album2.trackCount => album1 preceeds,
   * Same trackCount: album1.duration < album2.duration => album1 preceeds
   * Optimization criteria: max trackCounts within given playtime
   */
  private compareAlbums(album1:Album, album2:Album):number{
    let trackDiff = album2.trackCount - album1.trackCount;
    if(trackDiff === 0 ){
      return album1.durationMsec - album2.durationMsec;
    }
    return trackDiff;
  }

  //Experiments
  // selectedCityObject:{id:number, name:string};
  // readonly cityObjects: {id:number, name:string}[]  = [
  //   {id:-1, name: "Select City"},
  //   {id:0, name: "Toronto"},
  //   {id:1, name: "Tokyo"},
  //   {id:2, name: "London"},
  //   {id:3, name: "Sydney"}
  // ];

  // onSelect(city){
  //   this.selectedCityObject = city;
  // }
}
