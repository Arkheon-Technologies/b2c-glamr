import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID } from 'crypto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

/** Generate an internal placeholder email for staff members who don't have a login yet */
function ghostEmail(uuid: string) {
  return `staff-${uuid}@staff.internal`;
}

function notFound(msg = 'Staff member not found') {
  return new NotFoundException({ ok: false, error: { code: 'STAFF_NOT_FOUND', message: msg, request_id: randomUUID() } });
}
function forbidden(msg = 'You do not own this business') {
  return new ForbiddenException({ ok: false, error: { code: 'STAFF_ACCESS_DENIED', message: msg, request_id: randomUUID() } });
}

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  async listStaff(businessId: string, ownerId: string) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId }, select: { ownerId: true } });
    if (!business) throw notFound('Business not found');
    if (business.ownerId !== ownerId) throw forbidden();

    const staff = await this.prisma.staffMember.findMany({
      where: { businessId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        displayName: true,
        role: true,
        isActive: true,
        technicianProfile: { select: { avgRating: true, bookingCount: true } },
      },
    });

    return {
      ok: true,
      data: {
        staff: staff.map((s) => ({
          id: s.id,
          displayName: s.displayName,
          role: s.role,
          isActive: s.isActive,
          avg_rating: s.technicianProfile?.avgRating ?? null,
          booking_count: s.technicianProfile?.bookingCount ?? 0,
        })),
      },
    };
  }

  async createStaff(ownerId: string, dto: CreateStaffDto) {
    const business = await this.prisma.business.findUnique({ where: { id: dto.businessId }, select: { ownerId: true } });
    if (!business) throw notFound('Business not found');
    if (business.ownerId !== ownerId) throw forbidden();

    // Staff members require a linked User. Create a ghost account if no email provided.
    const staffGhostId = randomUUID();
    const userEmail = dto.email?.trim() || ghostEmail(staffGhostId);

    const ghostUser = await this.prisma.user.create({
      data: {
        id: staffGhostId,
        email: userEmail,
        fullName: dto.displayName,
        authProvider: 'internal',
        notificationPreferences: {},
      },
      select: { id: true },
    });

    const staffMember = await this.prisma.staffMember.create({
      data: {
        userId: ghostUser.id,
        businessId: dto.businessId,
        displayName: dto.displayName,
        role: dto.role as any,
        isActive: true,
      },
      select: { id: true, displayName: true, role: true, isActive: true },
    });

    return { ok: true, data: { staff: staffMember } };
  }

  async updateStaff(id: string, ownerId: string, dto: UpdateStaffDto) {
    const existing = await this.prisma.staffMember.findUnique({
      where: { id },
      select: { business: { select: { ownerId: true } } },
    });
    if (!existing) throw notFound();
    if (existing.business?.ownerId !== ownerId) throw forbidden();

    const updated = await this.prisma.staffMember.update({
      where: { id },
      data: {
        ...(dto.displayName !== undefined ? { displayName: dto.displayName } : {}),
        ...(dto.role !== undefined ? { role: dto.role as any } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      select: { id: true, displayName: true, role: true, isActive: true },
    });

    return { ok: true, data: { staff: updated } };
  }
}
