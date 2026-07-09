import { Injectable, NotFoundException } from '@nestjs/common';
import type { Estate, PaginatedResponse } from '@repo/types';

const mockEstates: Estate[] = [
  {
    id: '1',
    title: 'Modern Downtown Apartment',
    description: 'A beautiful modern apartment in the heart of downtown.',
    price: 2500,
    location: 'New York, NY',
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'],
    available: true,
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Beachfront Villa',
    description: 'Luxurious villa with stunning ocean views.',
    price: 5000,
    location: 'Malibu, CA',
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6'],
    available: true,
    createdAt: '2025-02-20T00:00:00Z',
    updatedAt: '2025-06-10T00:00:00Z',
  },
];

@Injectable()
export class EstatesService {
  findAll(page: number, limit: number): PaginatedResponse<Estate> {
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = mockEstates.slice(start, end);

    return {
      data,
      total: mockEstates.length,
      page,
      limit,
      totalPages: Math.ceil(mockEstates.length / limit),
    };
  }

  findOne(id: string): Estate {
    const estate = mockEstates.find((e) => e.id === id);
    if (!estate) {
      throw new NotFoundException(`Estate with id "${id}" not found`);
    }
    return estate;
  }
}
