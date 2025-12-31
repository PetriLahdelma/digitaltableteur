import imgSection from "figma:asset/67a7413564ddf6d171ef8ecd5f895a6261784121.png";

function Group() {
  return (
    <div className="font-['Moderat:Regular',sans-serif] grid-cols-[max-content] grid-rows-[max-content] inline-grid not-italic place-items-start relative shrink-0 text-[blue] w-full">
      <p className="[grid-area:1_/_1] leading-[40px] ml-0 mt-0 relative text-[36px] tracking-[0.3691px] w-[820px]">Download a schema for GenAI Design System</p>
      <p className="[grid-area:1_/_1] leading-[28px] ml-0 mt-[64px] relative text-[18px] tracking-[-0.4395px] w-[758.307px]">
        {`Supercharge your AI driven design system and guide it to deliver everything up-to-spec. `}
        <br aria-hidden="true" />
        Ensure all new components are following the same prop structure, naming and brand.
      </p>
    </div>
  );
}

function Frame() {
  return (
    <div className="[grid-area:1_/_1] bg-[#e9fe41] content-stretch flex h-[44px] items-center justify-center ml-0 mt-0 relative w-[171px]">
      <div aria-hidden="true" className="absolute border border-[blue] border-solid inset-0 pointer-events-none" />
      <p className="font-['Moderat:Regular',sans-serif] leading-[28px] not-italic relative shrink-0 text-[18px] text-[blue] text-nowrap tracking-[-0.4395px]">Button</p>
    </div>
  );
}

function Button() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0" data-name="Button">
      <Frame />
    </div>
  );
}

export default function Section() {
  return (
    <div className="relative size-full" data-name="Section">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute bg-[#ddf] inset-0" />
        <div className="absolute bg-repeat bg-size-[8px_8px] bg-top-left inset-0 opacity-20" style={{ backgroundImage: `url('${imgSection}')` }} />
      </div>
      <div aria-hidden="true" className="absolute border border-[blue] border-solid inset-0 pointer-events-none" />
      <div className="max-h-[inherit] max-w-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[32px] items-start leading-[0] max-h-[inherit] max-w-[inherit] px-[40px] py-[56px] relative size-full">
          <Group />
          <Button />
        </div>
      </div>
    </div>
  );
}