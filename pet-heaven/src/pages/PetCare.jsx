import PageHeader from '../components/PageHeader';
import Accordion from '../components/Accordion';
import Reveal from '../components/Reveal';
import { careTopics, videoTopics } from '../data/petCareTips';

export default function PetCare() {
  // Build the accordion content from the data file
  const items = careTopics.map((topic) => ({
    id: topic.id,
    title: `${topic.icon}  ${topic.title}`,
    content: (
      <>
        <p className="acc-summary">{topic.summary}</p>
        {topic.details.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <h4>Useful tips</h4>
        <ul className="check-list">
          {topic.tips.map((tip) => <li key={tip}>{tip}</li>)}
        </ul>
      </>
    ),
  }));

  return (
    <>
      <PageHeader title="Pet Care Tips" intro="Guides and videos to keep your companion healthy and happy." />

      <section className="section" aria-labelledby="guides-title">
        <div className="container narrow">
          <Reveal>
            <h2 id="guides-title">Care guides</h2>
            <p>Select a topic to read more. The first one is open to get you started.</p>
            <Accordion items={items} defaultOpen="feeding" />
          </Reveal>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="videos-title">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <h2 id="videos-title">Watch &amp; Learn</h2>
              <p>These cards open a video or YouTube search for helpful pet-care videos in a new tab.</p>
            </div>
            {['Dog Care', 'Cat Care'].map((category) => (
              <section
                key={category}
                className="video-category"
                aria-labelledby={`${category.toLowerCase().replace(' ', '-')}-title`}
              >
                <h3 id={`${category.toLowerCase().replace(' ', '-')}-title`}>{category}</h3>
                <div className="video-grid">
                  {videoTopics.filter((video) => video.category === category).map((video) => (
                    <a
                      key={video.id} className="video-card" target="_blank" rel="noopener noreferrer"
                      href={video.url || `https://www.youtube.com/results?search_query=${encodeURIComponent(video.query)}`}
                      aria-label={`${video.title} (opens ${video.url ? 'video' : 'YouTube search'} in a new tab)`}
                    >
                      <span className="play-circle" aria-hidden="true">▶</span>
                      <span className="video-title">{video.title}</span>
                      <span className="video-desc">{video.description}</span>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="emergency-title">
        <div className="container narrow">
          <div className="emergency-box">
            <h2 id="emergency-title">🚨 Emergency care reminder</h2>
            <p>Contact a veterinarian immediately if your pet shows any of these signs:</p>
            <ul className="check-list">
              <li>Difficulty breathing, collapse or seizures</li>
              <li>Heavy bleeding, or suspected poisoning (for example, chocolate, grapes or medication)</li>
              <li>Repeated vomiting, bloated belly or inability to pass urine</li>
              <li>Heatstroke signs: heavy panting, drooling, weakness</li>
            </ul>
            <p>Save the number of your nearest 24-hour veterinary clinic in your phone before you need it.</p>
          </div>
          <p className="note-text disclaimer">
            <strong>Disclaimer:</strong> The information on this page is general guidance only and is not a
            substitute for professional advice. Please consult a qualified veterinarian about any medical concern.
          </p>
        </div>
      </section>
    </>
  );
}
