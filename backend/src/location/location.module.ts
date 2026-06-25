import { Module } from '@nestjs/common';
import { GooglePlacesService } from './google-places.service';
import { GeolocationService } from './geolocation.service';
import { LocationController } from './location.controller';

@Module({
  controllers: [LocationController],
  providers: [GooglePlacesService, GeolocationService],
  exports: [GooglePlacesService, GeolocationService],
})
export class LocationModule {}
