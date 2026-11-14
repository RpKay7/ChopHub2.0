
import './SignatureExperiences.css';

const signatureExperiences = [
  {
    number: '01',
    category: 'OUR HERITAGE',
    title: 'The Nigerian Table',
    description:
      'A celebration of the rich flavours, familiar favourites and culinary traditions that make Nigerian food special.',
    image: '/images/menu/party-jollof.jpg',
    imageAlt: 'Nigerian party jollof rice',
  },
  {
    number: '02',
    category: 'BOLD & UNFORGETTABLE',
    title: 'Fire & Flavour',
    description:
      'Smoky aromas, carefully seasoned grills and the unmistakable character of bold Nigerian flavours.',
    image: '/images/menu/beef-suya.jpg',
    imageAlt: 'Nigerian beef suya',
  },
  {
    number: '03',
    category: 'THE JOY OF SHARING',
    title: 'Gather Around',
    description:
      'Some of the best moments happen around a table, with good food and even better company.',
    image: '/images/menu/moi-moi.jpg',
    imageAlt: 'Traditional Nigerian moi moi',
  },
  {
    number: '04',
    category: 'A BEAUTIFUL BEGINNING',
    title: 'Breakfast & Brunch',
    description:
      'From satisfying breakfast favourites to relaxed brunch moments, make every morning delicious.',
    image: '/images/menu/breakfast-brunch.jpg',
    imageAlt: 'Breakfast and brunch selection',
  },
  {
    number: '05',
    category: 'ROOTED IN TRADITION',
    title: 'Soups & Swallow',
    description:
      'A taste of home with rich Nigerian soups and traditional swallow favourites.',
    image: '/images/menu/soups-swallow.jpg',
    imageAlt: 'Nigerian soup and swallow',
  },
  {
    number: '06',
    category: 'A LITTLE INDULGENCE',
    title: 'Something Sweet',
    description:
      'Delightful desserts and sweet treats for those moments when only something special will do.',
    image: '/images/menu/something-sweet.jpg',
    imageAlt: 'Chocolate dessert',
  },
  {
    number: '07',
    category: 'REFRESH YOUR MOMENT',
    title: 'The Perfect Pour',
    description:
      'Refreshing juices, colourful mocktails and delicious drinks to complement every meal.',
    image: '/images/menu/perfect-pour.jpg',
    imageAlt: 'Refreshing tropical mocktail',
  },
  {
    number: '08',
    category: 'MIXED WITH CHARACTER',
    title: 'Crafted Cocktails',
    description:
      'A colourful showcase of cocktail-inspired creations, presented with style and character.',
    image: '/images/menu/crafted-cocktails.jpg',
    imageAlt: 'Colourful cocktail drinks',
  },
];

function SignatureExperiences() {
  return (
    <section className="signature-section" id="experiences">
      <div className="signature-container">

        <div className="signature-heading">
          <div className="signature-heading-left">
            <span className="signature-eyebrow">
              <span className="signature-eyebrow-line"></span>
              MORE THAN A MEAL
            </span>

            <h2>
              Experiences worth
              <br />
              <em>coming back for.</em>
            </h2>
          </div>

          <p className="signature-intro">
            Every plate tells a story. Every flavour creates a moment.
            Discover the ideas and inspirations behind the ChopHub experience.
          </p>
        </div>

        <div className="signature-grid">
          {signatureExperiences.map((item) => (
            <article className="signature-card" key={item.number}>
              <img
                src={item.image}
                alt={item.imageAlt}
                className="signature-card-image"
                loading="lazy"
              />

              <div className="signature-card-overlay"></div>

              <div className="signature-card-content">
                <div className="signature-card-top">
                  <span className="signature-card-number">
                    {item.number}
                  </span>
                </div>

                <div className="signature-card-bottom">
                  <span className="signature-card-category">
                    {item.category}
                  </span>

                  <h3>{item.title}</h3>

                  <p>{item.description}</p>

                  <span className="signature-card-line"></span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="signature-bottom">
          <span></span>
          <p>INSPIRED BY FLAVOUR. CREATED FOR CONNECTION.</p>
          <span></span>
        </div>

      </div>
    </section>
  );
}

export default SignatureExperiences;
