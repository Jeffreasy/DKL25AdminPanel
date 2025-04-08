import React, { useEffect, useState } from 'react';
import { loadInstagramEmbed } from '../../utils/socialScripts';
import { supabase } from '../../lib/supabase';

interface SocialEmbed {
  id: string;
  platform: 'instagram' | 'facebook';
  embed_code: string;
  order_number: number;
  visible: boolean;
}

interface TitleSection {
  id: string;
  title: string;
  subtitle: string;
  cta_text: string;
  image_url: string;
  event_details: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

const TitleSection: React.FC = () => {
  const [socialEmbeds, setSocialEmbeds] = useState<SocialEmbed[]>([]);
  const [titleData, setTitleData] = useState<TitleSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch title section data
        const { data: titleResponse, error: titleError } = await supabase
          .from('title_sections')
          .select('*')
          .single();

        if (titleError) throw titleError;
        setTitleData(titleResponse);

        // Fetch social embeds
        const { data: embedsResponse, error: embedsError } = await supabase
          .from('social_embeds')
          .select('*')
          .eq('visible', true)
          .order('order_number', { ascending: true });

        if (embedsError) throw embedsError;
        setSocialEmbeds(embedsResponse || []);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (socialEmbeds.length > 0) {
      const hasInstagram = socialEmbeds.some(embed => embed.platform === 'instagram');
      if (hasInstagram) loadInstagramEmbed();
    }
  }, [socialEmbeds]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!titleData) {
    return <div>No data available</div>;
  }

  return (
    <div>
      <h1>{titleData.title}</h1>
      <p>{titleData.subtitle}</p>
      <p>{titleData.cta_text}</p>
      
      <img 
        src={titleData.image_url} 
        alt="Title section image"
        className="w-full h-auto"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1100px] mx-auto">
        {socialEmbeds.map((embed) => (
          <div key={embed.id} className="w-full flex justify-center">
            {embed.platform === 'facebook' ? (
              <div className="fb-post-wrapper" style={{ width: '500px', maxWidth: '100%' }}>
                <div 
                  dangerouslySetInnerHTML={{ __html: embed.embed_code }}
                  className="w-full bg-white rounded-lg shadow-md overflow-hidden"
                />
              </div>
            ) : (
              <div 
                dangerouslySetInnerHTML={{ __html: embed.embed_code }}
                className="w-full max-w-[500px] bg-white rounded-lg shadow-md overflow-hidden"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TitleSection; 