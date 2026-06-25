import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessEntity } from '../../common/entities/business.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(BusinessEntity)
    private businessRepository: Repository<BusinessEntity>,
  ) {}

  async search(query: string) {
    return this.businessRepository.find({
      where: {
        name: query,
      },
    });
  }
}
