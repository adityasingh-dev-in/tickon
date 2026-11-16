import { LoginDto } from "@tickon/types";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginUserDto implements LoginDto {
  @IsString({message: "Email Must Be String!"})
  @IsNotEmpty({message: "Email Must not be empty!"})
  @IsString({message: "Invalid Email Format!"})
  @Transform(({value})=>{
    typeof(value) === 'string' ? value.trim().toLowerCase() : value
  })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
