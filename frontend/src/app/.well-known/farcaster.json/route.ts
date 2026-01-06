import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjkxNTIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgwMmVmNzkwRGQ3OTkzQTM1ZkQ4NDdDMDUzRURkQUU5NDBEMDU1NTk2In0",
      payload: "eyJkb21haW4iOiJhcHAuZXhhbXBsZS5jb20ifQ",
      signature: "MHgxMGQwZGU4ZGYwZDUwZTdmMGIxN2YxMTU2NDI1MjRmZTY0MTUyZGU4ZGU1MWU0MThiYjU4ZjVmZmQxYjRjNDBiNGVlZTRhNDcwNmVmNjhlMzQ0ZGQ5MDBkYmQyMmNlMmVlZGY5ZGQ0N2JlNWRmNzMwYzUxNjE4OWVjZDJjY2Y0MDFj"
    },
    miniapp: {
      version: "1",
      name: "PajaKripto",
      homeUrl: baseUrl,
      iconUrl: `${baseUrl}/pajakripto_logo.jpeg`,
      splashImageUrl: `${baseUrl}/pajakripto_logo.jpeg`,
      splashBackgroundColor: "#000000",
      subtitle: "Smart Crypto Tax Manager",
      description: "Track crypto transactions, calculate taxes automatically, and store tax funds in smart contracts on Base.",
      screenshotUrls: [
        `${baseUrl}/pajakripto_logo.jpeg`
      ],
      primaryCategory: "finance",
      tags: ["finance", "crypto", "tax"],
      heroImageUrl: `${baseUrl}/pajakripto_logo.jpeg`,
      tagline: "Manage crypto taxes easily",
      ogTitle: "PajaKripto - Smart Crypto Tax Management",
      ogDescription: "Track and manage your cryptocurrency tax obligations.",
      ogImageUrl: `${baseUrl}/pajakripto_logo.jpeg`,
      noindex: true
    }
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
