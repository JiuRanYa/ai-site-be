import { betterAuth } from "better-auth"
 
export const auth = betterAuth({
    //...other options
    emailAndPassword: {  
        enabled: true
    },
    trustedOrigins() {
        return ['http://localhost:3000', 'https://nexus.skin'];
    },
    socialProviders: { 
        github: { 
           clientId: process.env.GITHUB_CLIENT_ID as string, 
           clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        }, 
    }, 
});