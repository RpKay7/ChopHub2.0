
import './ExperienceSection.css';

const experiences = [
  {
    number: '01',
    title: 'Rooted in Nigerian Flavours',
    description:
      'From familiar Nigerian classics to exciting favourites, our menu celebrates the flavours we love.',
  },
  {
    number: '02',
    title: 'Made for Sharing',
    description:
      'Good food has a way of bringing people together. There is always room for one more at the table.',
  },
  {
    number: '03',
    title: 'Every Bite Matters',
    description:
      'We believe the little details matter — from the way a meal is presented to the experience of enjoying it.',
  },
];

function ExperienceSection() {
  return (
    <section className="experience-section" id="about">
      <div className="experience-container">

        {/* INTRODUCTION */}
        <div className="experience-intro">
          <div className="experience-heading-group">
            <div className="experience-label">
              <span></span>
              THE CHOPHUB EXPERIENCE
            </div>

            <h2>
              Good food is
              <br />
              <em>never just food.</em>
            </h2>
          </div>

          <div className="experience-description">
            <p className="experience-lead">
              It is the conversations around the table, the flavours
              that take you home, and the moments that stay with you.
            </p>

            <p>
              At ChopHub, we celebrate the joy of good food with a
              menu inspired by Nigerian favourites and the pleasure
              of sharing something delicious.
            </p>

            <a href="#menu" className="experience-link">
              Discover our menu
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="experience-divider"></div>

        {/* EXPERIENCE CARDS */}
        <div className="experience-grid">
          {experiences.map((item) => (
            <article className="experience-card" key={item.number}>
              <div className="experience-card-top">
                <span className="experience-number">
                  {item.number}
                </span>
              </div>

              <h3>{item.title}</h3>

              <p>{item.description}</p>

              <div className="experience-card-line"></div>
            </article>
          ))}
        </div>

        {/* CLOSING STATEMENT */}
        <div className="experience-closing">
          <span className="experience-closing-line"></span>
          <p>GOOD FOOD BRINGS US TOGETHER.</p>
          <span className="experience-closing-line"></span>
        </div>

      </div>
    </section>
  );
}

export default ExperienceSection;
