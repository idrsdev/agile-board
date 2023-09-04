import { Role } from './role.entity';
import { DataSource } from 'typeorm';
import { UserRole } from './role.enum';

export async function createRoles(conn: DataSource): Promise<void> {
  try {
    const roleRepository = conn.getRepository(Role);

    const predefinedRoles = [
      { name: UserRole.ADMIN },
      { name: UserRole.USER },
      // Add more roles as needed
    ];

    const existingRoles = await roleRepository.find();
    const existingRoleNames = existingRoles.map((role) => role.name);

    const newRoles = predefinedRoles.filter(
      (role) => !existingRoleNames.includes(role.name),
    );

    const createdRoles = roleRepository.create(newRoles);
    await roleRepository.save(createdRoles);

    console.log('Predefined roles created:', createdRoles);
  } catch (error) {
    console.error('Error creating predefined roles:', error);
  }
}
