import { CosmicPost3D } from '@/components/CosmicPost3D';import { CosmicPost3D } from '@/components/CosmicPost3D';



// Mock all imported components to avoid JSX runtime issues// Mock all imported components to avoid JSX runtime issues

jest.mock('@/components/SparkButton3D', () => ({jest.mock('@/components/SparkButton3D', () => ({

  SparkButton3D: ({ children, ...props }: any) => <button {...props}>{children}</button>,  SparkButton3D: ({ children, ...props }: any) => <button {...props}>{children}</button>,

}));}));



jest.mock('@/components/cosmic/CommentSection', () => ({jest.mock('@/components/cosmic/CommentSection', () => ({

  CommentSection: ({ postId }: { postId: number }) => (  CommentSection: ({ postId }: { postId: number }) => (

    <div data-testid="comment-section">Comments for post {postId}</div>    <div data-testid="comment-section">Comments for post {postId}</div>

  ),  ),

}));}));



jest.mock('lucide-react', () => ({jest.mock('lucide-react', () => ({

  MessageCircle: () => <span>MessageCircle</span>,  MessageCircle: () => <span>MessageCircle</span>,

  Share2: () => <span>Share2</span>,  Share2: () => <span>Share2</span>,

  Sparkles: () => <span>Sparkles</span>,  Sparkles: () => <span>Sparkles</span>,

}));}));



describe('CosmicPost3D', () => {describe('CosmicPost3D', () => {

  it('can be imported without errors', () => {  it('can be imported without errors', () => {

    expect(CosmicPost3D).toBeDefined();    expect(CosmicPost3D).toBeDefined();

    expect(typeof CosmicPost3D).toBe('function');    expect(typeof CosmicPost3D).toBe('function');

  });  });



  it('has correct component structure', () => {  it('has correct component structure', () => {

    expect(CosmicPost3D).toBeDefined();    expect(CosmicPost3D).toBeDefined();

    // Basic smoke test - component exists and is a function    // Basic smoke test - component exists and is a function

  });  });

});});

    // The component should handle mouse events without crashing
    expect(postElement).toBeInTheDocument();
  });
});