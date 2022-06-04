export class LogInDto {
  readonly nickname: string;
}
export class CreateRoomDto {
  readonly roomName: string;
}
export class DeleteRoomDto {
  readonly roomId: string;
}
export class EnterRoomDto {
  readonly roomName: string;
}
export class LeaveRoomDto {
  readonly roomName: string;
}
export class NewMessageDto {
  readonly roomName: string;
  readonly message: string;
}
