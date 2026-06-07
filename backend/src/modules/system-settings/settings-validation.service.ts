import { Injectable, BadRequestException } from "@nestjs/common";

interface ValidationRule {
  validate(value: string): string;
}

class StringRule implements ValidationRule {
  validate(value: string): string {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new BadRequestException("Value must be a non-empty string");
    }
    return value;
  }
}

class EmailRule implements ValidationRule {
  validate(value: string): string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new BadRequestException("Value must be a valid email address");
    }
    return value;
  }
}

class NumberRangeRule implements ValidationRule {
  constructor(
    private min: number,
    private max: number,
  ) {}

  validate(value: string): string {
    const num = Number(value);
    if (isNaN(num)) {
      throw new BadRequestException("Value must be a valid number");
    }
    if (num < this.min || num > this.max) {
      throw new BadRequestException(
        `Value must be between ${this.min} and ${this.max}`,
      );
    }
    return value;
  }
}

class BooleanRule implements ValidationRule {
  validate(value: string): string {
    if (value !== "true" && value !== "false") {
      throw new BadRequestException("Value must be 'true' or 'false'");
    }
    return value;
  }
}

class JsonRule implements ValidationRule {
  validate(value: string): string {
    try {
      JSON.parse(value);
      return value;
    } catch {
      throw new BadRequestException("Value must be valid JSON");
    }
  }
}

class PhoneRule implements ValidationRule {
  validate(value: string): string {
    const phoneRegex = /^[+\d][\d\s\-().]{6,}$/;
    if (!phoneRegex.test(value)) {
      throw new BadRequestException("Value must be a valid phone number");
    }
    return value;
  }
}

type RuleFactory = () => ValidationRule;

const VALIDATION_RULES: Record<string, RuleFactory> = {
  "SECURITY.password_min_length": () => new NumberRangeRule(8, 128),
  "SECURITY.max_login_attempts": () => new NumberRangeRule(1, 20),
  "SECURITY.session_timeout": () => new NumberRangeRule(60, 86400),
  "MAINTENANCE.enabled": () => new BooleanRule(),
  "NOTIFICATIONS.email_enabled": () => new BooleanRule(),
  "NOTIFICATIONS.sms_enabled": () => new BooleanRule(),
  "PLATFORM.support_email": () => new EmailRule(),
  "PLATFORM.support_phone": () => new PhoneRule(),
};

const VALUE_TYPE_RULES: Record<string, RuleFactory> = {
  STRING: () => new StringRule(),
  NUMBER: () => new NumberRangeRule(-Infinity, Infinity),
  BOOLEAN: () => new BooleanRule(),
  JSON: () => new JsonRule(),
};

@Injectable()
export class SettingsValidationService {
  validateSetting(
    category: string,
    key: string,
    value: string,
    valueType: string,
  ): string {
    const ruleKey = `${category}.${key}`;
    const specificRule = VALIDATION_RULES[ruleKey];

    if (specificRule) {
      return specificRule().validate(value);
    }

    const typeRule = VALUE_TYPE_RULES[valueType];
    if (typeRule) {
      return typeRule().validate(value);
    }

    return value;
  }
}
