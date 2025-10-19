import UniversalSpaceLayout from '@/components/UniversalSpaceLayout';
import ZodiacChatRooms from '../src/components/ZodiacChatRooms';

export default function ChatPage() {
  return (
    <UniversalSpaceLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Chat</h1>
        <ZodiacChatRooms />
      </div>
    </UniversalSpaceLayout>
  );
}

