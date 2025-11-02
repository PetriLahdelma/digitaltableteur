import React from "react";
import Testimonial from "./Testimonial";

export default {
  title: "Components/Testimonial",
  component: Testimonial,
  parameters: {
    layout: "padded",
  },
};

export const Default = () => (
  <Testimonial
    quote="Working with Digitaltableteur was an exceptional experience. Petri delivered exactly what we needed with incredible attention to detail and professionalism."
    name="Sarah Johnson"
    title="Product Manager"
    company="TechCorp"
    linkedinUrl="https://linkedin.com/in/sarahjohnson"
  />
);

export const WithAvatar = () => (
  <Testimonial
    quote="The design system created by Petri transformed our entire product line. The quality and consistency exceeded our expectations."
    name="Marcus Chen"
    title="Design Director"
    company="InnovateNow"
    linkedinUrl="https://linkedin.com/in/marcuschen"
    avatarUrl="/pete.png"
  />
);

export const LongTestimonial = () => (
  <Testimonial
    quote="Digitaltableteur brought a level of expertise and creativity to our project that we hadn't experienced before. The combination of technical skill and design vision resulted in a product that not only met our requirements but significantly enhanced our user experience."
    name="Elena Korhonen"
    title="Chief Technology Officer"
    company="Nordic Solutions"
    linkedinUrl="https://linkedin.com/in/elenakorhonen"
  />
);

export const WithoutLinkedIn = () => (
  <Testimonial
    quote="Outstanding work on our rebranding project. The results speak for themselves."
    name="David Wilson"
    title="CEO"
    company="StartupHub"
  />
);
