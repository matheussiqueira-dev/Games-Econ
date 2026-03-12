import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FriendItem } from './friend-item';
import { iFriend, FriendStatus } from '../../interfaces/friend.interface';

describe('FriendItem', () => {
  let component: FriendItem;
  let fixture: ComponentFixture<FriendItem>;

  const mockFriend: iFriend = {
    id: '1',
    username: 'TestUser',
    avatar: 'test-avatar.jpg',
    status: FriendStatus.Online
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendItem],
    }).compileComponents();

    fixture = TestBed.createComponent(FriendItem);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('friend', mockFriend);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
