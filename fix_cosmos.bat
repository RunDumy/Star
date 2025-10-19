@echo off
cd /d c:\Users\fudos\PycharmProjects\Star\star-frontend
echo import dynamic from 'next/dynamic'; > pages/collaborative-cosmos.jsx
echo. >> pages/collaborative-cosmos.jsx
echo const CollaborativeCosmos = dynamic(() => import('../src/components/cosmic/CollaborativeCosmos'), { ssr: false }); >> pages/collaborative-cosmos.jsx
echo. >> pages/collaborative-cosmos.jsx
echo export default function CollaborativeCosmosPage() { >> pages/collaborative-cosmos.jsx
echo   return ^<CollaborativeCosmos /^>; >> pages/collaborative-cosmos.jsx
echo } >> pages/collaborative-cosmos.jsx