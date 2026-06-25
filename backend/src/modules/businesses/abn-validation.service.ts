import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface ABNRecord {
  acn: string;
  abn: string;
  entityType: string;
  entityName: string;
  businessName: string;
  state: string;
  lastUpdated: string;
  isActive: boolean;
}

@Injectable()
export class ABNValidationService {
  private readonly ABN_LOOKUP_URL = 'https://api.asic.gov.au/file/abn-search-api';

  async validateABN(abn: string): Promise<ABNRecord | null> {
    const cleanedABN = abn.replace(/\s/g, '');

    if (!this.isValidABNFormat(cleanedABN)) {
      return null;
    }

    try {
      const response = await axios.get(
        `${this.ABN_LOOKUP_URL}?abn=${cleanedABN}&format=json`,
        {
          timeout: 5000,
          headers: {
            'User-Agent': 'Urban-Help/1.0',
          },
        },
      );

      if (response.data && response.data.abns && response.data.abns.length > 0) {
        const record = response.data.abns[0];
        return {
          acn: record.acn || '',
          abn: record.abn,
          entityType: record.entityType,
          entityName: record.entityName,
          businessName: record.businessName,
          state: record.state,
          lastUpdated: record.lastUpdated,
          isActive: record.status === 'Active',
        };
      }

      return null;
    } catch (error) {
      console.error('ABN validation error:', error);
      return null;
    }
  }

  private isValidABNFormat(abn: string): boolean {
    if (!/^\d{11}$/.test(abn)) {
      return false;
    }

    const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    const digits = abn.split('').map(Number);
    const adjustedFirstDigit = digits[0] - 1;

    let sum = adjustedFirstDigit * weights[0];
    for (let i = 1; i < 11; i++) {
      sum += digits[i] * weights[i];
    }

    return sum % 89 === 0;
  }
}
