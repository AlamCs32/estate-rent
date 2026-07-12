import type { DataSource } from 'typeorm';
import { EstateEntity } from '@/estates/entities/estate.entity';

export async function seedEstates(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(EstateEntity);

  const count = await repo.count();
  if (count > 0) {
    return;
  }

  const estates = [
    {
      title: 'Modern Downtown Apartment',
      description:
        'A beautiful modern apartment in the heart of downtown with panoramic city views.',
      price: 2500,
      location: 'New York, NY',
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'],
      available: true,
    },
    {
      title: 'Beachfront Villa',
      description: 'Luxurious villa with stunning ocean views and private beach access.',
      price: 5000,
      location: 'Malibu, CA',
      images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6'],
      available: true,
    },
    {
      title: 'Cozy Mountain Cabin',
      description: 'Rustic cabin nestled in the mountains with a fireplace and hot tub.',
      price: 1800,
      location: 'Aspen, CO',
      images: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233'],
      available: true,
    },
    {
      title: 'Luxury Penthouse Suite',
      description: 'Top-floor penthouse with terrace, pool, and 360-degree city views.',
      price: 8000,
      location: 'New York, NY',
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
      available: false,
    },
    {
      title: 'Charming Studio Loft',
      description: 'Industrial-chic studio in the arts district with exposed brick walls.',
      price: 1200,
      location: 'Austin, TX',
      images: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9'],
      available: true,
    },
  ];

  await repo.save(estates);
}
