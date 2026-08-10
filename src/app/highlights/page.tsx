import Image from "next/image";

const highlights = [
  {
    title: "Prom Kills Admiral MooMoo",
    session: "Session 1",
    image: "/highlights/prom-kills-admiral-moomoo.png",
    alt: "Prom lands the final greataxe blow against Admiral MooMoo while the party fights beneath the bells of the Lost Forest.",
    caption:
      "The bells in the Lost Forest belonged to Admiral MooMoo, the undead cow at the center of the forest’s danger. Prom landed the killing blow and earned the party’s first MVP.",
  },
  {
    title: "The Artifact Chooses Seris",
    session: "Session 2",
    image: "/highlights/seris-claims-moonfall-artifact.png",
    alt: "Seris floats above Moonfall's lunar altar as the first artifact binds to her and visions of the remaining relics appear.",
    caption:
      "After Mara’s death, the fight with the robed faction, and Selune’s trial, the artifact in Moonfall Grotto forcibly attuned to Seris. Its vision revealed five other linked relics across the region.",
  },
  {
    title: "Stranger Danger Was Not Covered",
    session: "Session 3",
    image: "/highlights/echo-mead-invite-burglars.png",
    alt: "Echo and Mead separately welcome three suspicious night visitors into their roadside tents while the women quietly reach for their belongings.",
    caption:
      "During the roadside long rest, Echo and Mead each invited the night visitors into their respective tents and ignored every warning sign available to them. By morning, the women were gone—and so were the party’s coin and gear.",
  },
  {
    title: "Prom Solves the Robbery",
    session: "Session 3",
    image: "/highlights/prom-tramples-women-thieves.png",
    alt: "Prom charges through the thieves' camp on a stolen horse as the three women who robbed the party scramble through the mud.",
    caption:
      "After Mead and Echo let three women into camp and woke up missing gold and gear, the party followed them to the nearby bandit camp. Prom commandeered a horse and trampled all three, killing two, before the party rescued Edrin and Lyra.",
  },
  {
    title: "The Belligerent Five",
    session: "Campaign Memory",
    image: "/highlights/belligerent-five-are-named.png",
    alt: "Echo, Mead, Prom, and Heywud argue around a wrecked tavern table as an innkeeper stares through a newly broken wall.",
    caption:
      "By the time the party left Moonfall behind, the Belligerent Five had become the name attached to their growing trail of relics, rescued prisoners, dead enemies, and decisions that usually made things louder.",
  },
  {
    title: "The Stones Begin to Sing",
    session: "Session 4",
    image: "/highlights/defaced-aelwyn-statue-unknown-drow-vision.png",
    alt: "The party restores Greyhaven's defaced statue of Aelwyn as its stones sing and project a vision of an unknown horned drow.",
    caption:
      "In Greyhaven, the party stopped robed officials from finishing the erasure of a disputed memorial and restored its dismantled stones. Echo completed the melody, and the singing shrine showed him a calm drow cutting his palm over a basin in a red-lit ritual chamber.",
  },
  {
    title: "The Inn Was an Execution",
    session: "Session 5",
    image: "/highlights/edrin-inn-ambush.png",
    alt: "Wet, familiar attackers flood a shattered inn room as Edrin falls and the party struggles to protect the downed Echo.",
    caption:
      "The party chose an inn because it seemed safer than another roadside camp. The attackers struck inside their room, killed Edrin almost immediately, and dropped Echo in the opening exchange before the party recovered and took control of the fight.",
  },
  {
    title: "Echo Gives Prom the Testament",
    session: "Session 6",
    image: "/highlights/bloodbound-testament-chooses-prom-v2.png",
    alt: "The Bloodbound Testament changes from Echo's dagger into a massive greataxe for Prom after the Circle of Promise.",
    caption:
      "Mead and Echo gave blood to open the Circle of Promise, and Echo claimed the dagger sealed inside. After the weapon pushed Echo toward killing Lyra, he bequeathed the Bloodbound Testament to Prom, where it took the form of a greataxe.",
  },
  {
    title: "The Marsh Stops Breathing",
    session: "Session 6",
    image: "/highlights/weeping-marsh-stops-breathing-v2.png",
    alt: "A silent shockwave throws Mead backward as Echo, Prom, Heywud, and Aylin surround the artifact deep in the moonlit Weeping Marsh.",
    caption:
      "After falling eighty feet down a well on the way in, Mead still reached the artifact first. When he touched it, the marsh stopped breathing and blasted him backward into the whetstone as the artifact site came alive.",
  },
  {
    title: "The Marsh Kills Aylin",
    session: "Session 6 • Weeping Marsh",
    image: "/highlights/lyra-return-kills-aylin-v2.png",
    alt: "The marsh-made return of Lyra lands a fatal root-covered blow to Aylin's head as the high elf assassin lunges for the artifact.",
    caption:
      "Aylin ran straight to the front to take the artifact, and the marsh-made Lyra bashed her head in with a legendary action. Mead brought Aylin back after the fight; her first response was to tell the entire party to fuck off.",
  },
  {
    title: "Kelsier Is Thrown Back",
    session: "Session 7 • Weeping Marsh Exit",
    image: "/highlights/kelsier-body-weeping-marsh.png",
    alt: "Robed attackers throw Kelsier's tortured body onto the marsh path in front of the horrified party.",
    caption:
      "As the party left the Weeping Marsh, the robed attackers dragged Kelsier’s body through the grass and threw it onto the path. They had tortured him for information, killed him, and now demanded to know where the half-elf girl had gone and what the party had brought up from below.",
  },
  {
    title: "Prom Breaks the Crown",
    session: "Session 7",
    image: "/highlights/prom-purges-crown-of-madness.png",
    alt: "The Tearstone shatters the Crown of Madness as Prom's greataxe stops inches from Echo.",
    caption:
      "During the ambush at the marsh exit, Crown of Madness nearly forced Prom to swing the Bloodbound Testament into Echo. The Tearstone of the Waning Tide purged the charm just before the blow, and Prom turned his weapons back on the attackers.",
  },
  {
    title: "A Completely Fair Dice Game",
    session: "Session 7",
    image: "/highlights/roadside-dice-disaster.png",
    alt: "An old roadside traveler happily gathers the party's gold while Echo, Mead, Prom, and Heywud process losing the dice game.",
    caption:
      "On the road to Lunaryth, an old traveler beat the party at dice and won all of their gold. Rather than accept the loss, they murdered him and took it back.",
  },
  {
    title: "Echo Sees Aelwyn",
    session: "Session 8",
    image: "/highlights/echo-vision-blonde-aelwyn.png",
    alt: "Echo touches Aelwyn's statue as her living image appears before a vision of ancient Lunaryth burning.",
    caption:
      "Echo played the melody etched into Aelwyn Vaeloris’s statue and was pulled into a vision of ancient Lunaryth burning. He saw a dying Aelwyn stand against a beautiful drow, raise a bloody hand toward the moon, and tell him, ‘You do not get the next age.’",
  },
  {
    title: "Aelwyn Passes On the Melody",
    session: "Session 8 • Aelwyn's Vision",
    image: "/highlights/echo-aelwyn-across-time.png",
    alt: "Echo and the living Aelwyn play the same silver melody in two eras divided by moonlight beside her weathered statue.",
    caption:
      "After banishing the drow, Aelwyn collapsed and passed the melody into the hands of the person holding an instrument. She hummed the same tune carved into the statue, tying Echo’s visions directly to Lunaryth’s buried history.",
  },
  {
    title: "The Red Light Underground",
    session: "Session 8",
    image: "/highlights/lunaryth-red-light-underground.png",
    alt: "The party makes its way through Lunaryth's sprawling subterranean Red Light district.",
    caption:
      "The party first entered the Red Light district to spend money, mix with the courtesans, and distract themselves. Seris later brought them back and revealed that her mother had once worked there, connecting her family to Lunaryth’s buried history and the rumor of star-touched twins.",
  },
  {
    title: "Making Fools of Themselves Underground",
    session: "Session 8 • Underground",
    image: "/highlights/red-light-performance-prom.png",
    alt: "Echo leads a packed underground performance while Mead drums, Prom holds a parasol, Heywud conjures dancers, and Seris watches from a balcony.",
    caption:
      "Mead and Prom behaved badly enough to make the Red Light district memorable, while the rest of the party spent money and made fools of themselves in their own ways. The visit stopped being a distraction once Seris revealed why the district mattered to her mother.",
  },
  {
    title: "Heywud Dies. Seris Disagrees.",
    session: "Session 8 • Hidden Temple",
    image: "/highlights/seris-resurrects-heywud-aberration.png",
    alt: "Seris channels brilliant lunar light into the dead Heywud as the aberration that killed him looms in the hidden tunnels beneath Lunaryth.",
    caption:
      "On the way out of the hidden temple, a black pendant cracked open and released a bound aberration that killed Heywud in the tunnels. Seris resurrected him, the party brought down the creature, and they kept the pendant that had released it.",
  },
  {
    title: "Nyx's Reputation Precedes Her",
    session: "Guild Games History",
    image: "/highlights/nyx-last-championship.png",
    alt: "Nyx Amberline stands amid defeated arena combatants with violet and infernal magic burning in her hands.",
    caption:
      "Nyx Amberline entered the current Games as a former champion of the Mercantile League with a reputation for killing opponents when the spectacle turned lethal. She remained the opponent to beat until Mead met her in the final.",
  },
  {
    title: "Mead Wins the Guild Games",
    session: "Session 9",
    image: "/highlights/mead-defeats-nyx-guild-games.png",
    alt: "Mead raises his warhammer after defeating Nyx Amberline in the Guild Games final while Echo, Prom, and Heywud celebrate.",
    caption:
      "Mead fought through the Guild Games and defeated former champion Nyx Amberline in the final. Winning broke the Mercantile League’s six-year hold on the tournament and gave the party the public standing needed to enter Lunaryth’s elite reception.",
  },
  {
    title: "Aelwyn Casts Him Beyond",
    session: "Session 10 • Ancient Lunaryth",
    image: "/highlights/aelwyn-banishes-unknown-horned-drow.png",
    alt: "The mortally wounded blonde Aelwyn tears open a dimensional rift and banishes the drow attacker from burning ancient Lunaryth.",
    caption:
      "As ancient Lunaryth burned, the dying Aelwyn raised her bloody hand toward the moon, opened a doorway to another dimension, and banished the drow who had attacked the city. Elyndor’s public version of the story erased what she had done.",
  },
  {
    title: "Echo Exposes the Lie",
    session: "Session 10",
    image: "/highlights/echo-exposes-the-lie.png",
    alt: "Echo plays before the Vesperveil Crystal as the truth of Aelwyn's sacrifice fills the ballroom and Elyndor recoils.",
    caption:
      "Echo interrupted Elyndor’s staged history and used the Vesperveil Crystal to reveal what Aelwyn had really done, exposing Elyndor as a fraud. The truth brought the drow into the open, and he attacked everyone at the demonstration. Shadow of Moil nearly let him wipe out the party before Seris’s Channel Divinity stripped it away and the party barely brought him down.",
  },
  {
    title: "Elyndor Exposed and Subdued",
    session: "Session 10",
    image: "/highlights/elyndor-subdued-grey-hair-ballroom.png",
    alt: "Seris restrains her silver-haired father Elyndor with lunar magic as the battered party surrounds him in Lunaryth Castle's ballroom.",
    caption:
      "Echo’s revelation destroyed Elyndor’s public story in front of the people whose faith had protected him. The party subdued Elyndor alive, leaving his false history exposed and his authority broken.",
  },
  {
    title: "High Priestess of Lunaryth",
    session: "Session 10 • Aftermath",
    image: "/highlights/high-priestess-of-lunaryth.png",
    alt: "Lunaryth's clergy kneels as a crown of moonlight forms above the battered red-haired Seris in her lunar-yellow robes.",
    caption:
      "After the party recovered, Lunaryth recognized Seris as part of its divine bloodline and named her High Priestess. For a short time, the city seemed to have survived the exposure of Elyndor’s history and the battle that followed.",
  },
  {
    title: "The Dragons Descend",
    session: "Session 10",
    image: "/highlights/dragons-descend-lunaryth.png",
    alt: "One dragon freezes part of Lunaryth while another attacks with fire and lightning as Prom watches from a rooftop.",
    caption:
      "The calm ended when two dragons attacked Lunaryth: one with killing ice, the other with fire and lightning. The destruction matched Echo’s vision of the burning city, and Prom realized the lightning that struck him as a child had come from the dragon now in front of him.",
  },
] as const;

export default function HighlightsPage() {
  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <div className="text-sm font-medium uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">
          The story in pictures
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Campaign Highlights</h1>
        <p className="mt-2 text-black/70 dark:text-white/70">
          The victories, disasters, revelations, and deeply questionable decisions that shaped the Belligerent Five.
        </p>
      </header>

      <div className="space-y-8">
        {highlights.map((highlight, index) => (
          <article
            key={highlight.image}
            className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-950"
          >
            <a href={highlight.image} target="_blank" rel="noreferrer" className="block">
              <div className="relative aspect-[3/2] w-full overflow-hidden bg-black">
                <Image
                  src={highlight.image}
                  alt={highlight.alt}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1152px) 100vw, 1152px"
                  className="object-cover transition duration-500 group-hover:scale-[1.015]"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />
                <div className="absolute bottom-4 right-4 rounded-full border border-white/20 bg-black/45 px-3 py-1 text-xs text-white/90 backdrop-blur">
                  Open full size ↗
                </div>
              </div>
            </a>

            <div className="p-5 sm:p-6">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                {highlight.session}
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{highlight.title}</h2>
              <p className="mt-2 max-w-4xl leading-7 text-black/70 dark:text-white/70">{highlight.caption}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
