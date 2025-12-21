import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.location.findMany({ orderBy: { city: 'asc' } });
  }

  async search(q: string = '') {
    console.log({ q });

    let city = '',
      state = '',
      country = '';
    const searchResults: string[] = [];
    const parts = q
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (parts.length === 1) {
      city = state = country = parts[0];
    } else if (parts.length === 2) {
      state = parts[0];
      country = parts[1];
    } else if (parts.length === 3) {
      city = parts[0];
      state = parts[1];
      country = parts[2];
    }
    const whereClauseOR: Record<string, any>[] = [];

    if (city) {
      whereClauseOR.push({ city: { contains: city, mode: 'insensitive' } });
    }
    if (state) {
      whereClauseOR.push({ state: { contains: state, mode: 'insensitive' } });
    }
    if (country) {
      whereClauseOR.push({
        country: { contains: country, mode: 'insensitive' },
      });
    }

    const results = await this.prisma.location.findMany({
      where: { OR: whereClauseOR },
      orderBy: { city: 'asc' },
    });
    console.log({ results });

    results.forEach((location) => {
      console.log(
        'dgsdg',
        q.toLowerCase().includes(location?.country?.toLowerCase() || ''),
      );
      console.log(
        'dfgdsfg',
        q.toLowerCase().includes(location?.state?.toLowerCase() || ''),
      );
      console.log(
        'sdfsdf',
        q.toLowerCase().includes(location?.city?.toLowerCase() || ''),
      );

      if (
        location.country &&
        q.toLowerCase().includes(location.country.toLowerCase())
      ) {
        searchResults.push(location.country);
      }
      if (location.state && searchResults.includes(location.state)) {
        searchResults.push(`${location.state}, ${location.country}`);
      }
      if (location.city && searchResults.includes(location.city)) {
        searchResults.push(
          `${location.city}, ${location.state}, ${location.country}`,
        );
      }
    });
    return Array.from(new Set(searchResults));
  }
}
