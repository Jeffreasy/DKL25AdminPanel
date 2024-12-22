declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process(): void;
      };
    };
    FB?: {
      XFBML: {
        parse(): void;
      };
    };
  }
}

export const loadInstagramEmbed = () => {
  if (window.instgrm) {
    window.instgrm.Embeds.process();
  } else {
    const script = document.createElement('script');
    script.src = '//www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
  }
};

export const loadFacebookEmbed = () => {
  // Voeg Facebook SDK toe
  const fbRoot = document.getElementById('fb-root');
  if (!fbRoot) {
    const root = document.createElement('div');
    root.id = 'fb-root';
    document.body.appendChild(root);
  }

  if (window.FB) {
    window.FB.XFBML.parse();
  } else {
    // Load the SDK asynchronously
    ((d, s, id) => {
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      const js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://connect.facebook.net/nl_NL/sdk.js#xfbml=1&version=v18.0";
      fjs.parentNode?.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  }
}; 