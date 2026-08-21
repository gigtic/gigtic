const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `    // Remove existing channel if we are reconnecting to prevent duplicate listeners
    const existingChannel = supabase.getChannels().find(c => c.topic === \`realtime:\${channelName}\`);
    if (existingChannel) {
      await supabase.removeChannel(existingChannel);
    }`;

const replacement = `    // Remove existing channel if we are reconnecting to prevent duplicate listeners
    const existingChannels = supabase.getChannels();
    for (const c of existingChannels) {
      if (c.topic.includes(channelName)) {
        await supabase.removeChannel(c);
      }
    }`;

code = code.replace(target, replacement);
fs.writeFileSync(file, code);
