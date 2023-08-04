import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { BoardMemberType } from '../board-member-type.enum';

@ValidatorConstraint({ name: 'isAllowedRole', async: false })
export class IsAllowedRoleConstraint implements ValidatorConstraintInterface {
  validate(role: any, args: ValidationArguments) {
    const allowedRoles = Object.values(BoardMemberType).filter(
      (value) => value !== BoardMemberType.OWNER,
    );
    return allowedRoles.includes(role);
  }

  defaultMessage(args: ValidationArguments) {
    return `Role must be one of the following values: ${Object.values(
      BoardMemberType,
    )
      .filter((value) => value !== BoardMemberType.OWNER)
      .join(', ')}`;
  }
}

export function IsAllowedRole(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAllowedRoleConstraint,
    });
  };
}
