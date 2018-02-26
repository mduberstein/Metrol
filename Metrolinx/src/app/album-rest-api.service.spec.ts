import { TestBed, inject } from '@angular/core/testing';
import { AlbumRestApiService } from './album-rest-api.service';

describe('AlbumRestApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AlbumRestApiService]
    });
  });

  it('should be created', inject([AlbumRestApiService], (service: AlbumRestApiService) => {
    expect(service).toBeTruthy();
  }));
});
