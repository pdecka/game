import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@gaming-platform/shared';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
