-- Soundify Seed Data for Supabase
-- Run after supabase/schema.sql

insert into public.artists (id, name, bio, genre, monthly_listeners, followers, verified) values
('art-1', 'Nova Lane', 'Analog synthesizer producer crafting nocturnal highway soundscapes and warm modular grooves.', 'Electronic', 1240000, 482000, true),
('art-2', 'Aarav Sen', 'Acoustic storyteller blending intimate fingerstyle guitar with warm melodic phrasing.', 'Romantic', 980000, 391000, true),
('art-3', 'Mira Kapoor', 'Indie-pop vocalist and multi-instrumentalist known for sun-drenched chords and honest lyricism.', 'Indie', 845000, 310000, true),
('art-4', 'Kieran Vale', 'Minimalist pianist and neo-classical composer recording on felt-hammer upright pianos.', 'Classical', 620000, 215000, true),
('art-5', 'Solstice Bloom', 'Downtempo duo weaving coastal field recordings with lush Rhodes keys and crisp percussion.', 'Chill', 730000, 264000, true),
('art-6', 'Velvet Signal', 'High-energy alt-rock quartet driven by crisp guitar riffs and arena-ready rhythms.', 'Rock', 540000, 198000, true),
('art-7', 'Rohan Verma', 'Contemporary pop producer pairing crisp brass hooks with late-night city groove.', 'Pop', 1120000, 425000, true),
('art-8', 'Elena Rostova', 'Chamber strings arranger and nocturnal solo violinist exploring quiet harmonic spaces.', 'Classical', 410000, 142000, false),
('art-9', 'Soren & The Tide', 'Road-trip folk-rock collective writing anthems for coastal highways and open skies.', 'Road Trip', 675000, 230000, true),
('art-10', 'Zara Lin', 'Electro-pop songwriter blending crisp vocal chops with uplifting club baselines.', 'Party', 890000, 340000, true),
('art-11', 'Pulse Foundry', 'Kinetic bass and tempo-locked synth workouts built for high-intensity training sessions.', 'Workout', 515000, 174000, false),
('art-12', 'Kabir Mehta', 'Ambient sound designer crafting deep focus soundbeds and binaural tape loops.', 'Focus', 470000, 165000, true),
('art-13', 'Nadia Cruz', 'Warm neo-soul and romantic acoustic pop vocalist with effortless velvet harmonies.', 'Romantic', 605000, 210000, true),
('art-14', 'Echo Harbour', 'Dream-pop trio layering shimmering chorus guitars over steady motorik drums.', 'Indie', 385000, 129000, false),
('art-15', 'Tarek Vance', 'Progressive synthwave architect exploring deep sub-bass and crisp analog arpeggios.', 'Electronic', 455000, 158000, true)
on conflict (id) do nothing;

insert into public.albums (id, title, artist_id, artist_name, release_year, genre, description) values
('alb-1', 'After Dark', 'art-1', 'Nova Lane', 2025, 'Electronic', 'Four nocturnal synthesizer journeys built for late-night drives.'),
('alb-2', 'Golden Window', 'art-2', 'Aarav Sen', 2025, 'Romantic', 'Intimate acoustic sessions recorded by an open sunlit window.'),
('alb-3', 'Basalt & Mist', 'art-5', 'Solstice Bloom', 2024, 'Chill', 'Calm atmospheric grooves inspired by Atlantic cliffs at dusk.'),
('alb-4', 'Paper Lanterns', 'art-3', 'Mira Kapoor', 2025, 'Indie', 'Crisp indie-pop vignettes about late summers and rooftops.'),
('alb-5', 'Felt & Ivory', 'art-4', 'Kieran Vale', 2024, 'Classical', 'Close-mic solo piano studies for deep concentration.'),
('alb-6', 'Static Horizon', 'art-6', 'Velvet Signal', 2025, 'Rock', 'Driving guitars and punchy drums engineered for open roads.'),
('alb-7', 'Skyline Fever', 'art-7', 'Rohan Verma', 2026, 'Pop', 'Widescreen modern pop melodies infused with synth basslines.'),
('alb-8', 'Highway 101', 'art-9', 'Soren & The Tide', 2024, 'Road Trip', 'Sun-bleached guitars crafted for long weekend drives.'),
('alb-9', 'Kinetic State', 'art-11', 'Pulse Foundry', 2026, 'Workout', 'Relentless 128 BPM studio electronics for peak momentum.'),
('alb-10', 'Deep Tape Loops', 'art-12', 'Kabir Mehta', 2025, 'Focus', 'Warm analog drone textures for uninterrupted flow.')
on conflict (id) do nothing;

insert into public.songs (id, title, artist_id, artist_name, album_id, album_title, genre, mood, duration, audio_url, release_year, popularity, track_number, key_hz, bpm) values
('sng-1', 'Midnight Drive', 'art-1', 'Nova Lane', 'alb-1', 'After Dark', 'Electronic', 'Road Trip', 222, 'synth://midnight-drive', 2025, 98, 1, 196, 114),
('sng-2', 'Neon Skies', 'art-1', 'Nova Lane', 'alb-1', 'After Dark', 'Electronic', 'Party', 205, 'synth://neon-skies', 2025, 94, 2, 220, 120),
('sng-3', 'After Hours', 'art-1', 'Nova Lane', 'alb-1', 'After Dark', 'Electronic', 'Chill', 238, 'synth://after-hours', 2025, 91, 3, 174.6, 102),
('sng-4', 'Sodium Rain', 'art-1', 'Nova Lane', 'alb-1', 'After Dark', 'Electronic', 'Focus', 194, 'synth://sodium-rain', 2025, 86, 4, 164.8, 108),
('sng-5', 'Monsoon Letter', 'art-2', 'Aarav Sen', 'alb-2', 'Golden Window', 'Romantic', 'Romantic', 218, 'synth://monsoon-letter', 2025, 95, 1, 246.9, 84),
('sng-6', 'Sunlit Linen', 'art-2', 'Aarav Sen', 'alb-2', 'Golden Window', 'Romantic', 'Chill', 196, 'synth://sunlit-linen', 2025, 89, 2, 220, 78),
('sng-7', 'Quiet Courtyards', 'art-2', 'Aarav Sen', 'alb-2', 'Golden Window', 'Indie', 'Romantic', 210, 'synth://quiet-courtyards', 2025, 84, 3, 196, 88),
('sng-8', 'Coastal Echo', 'art-5', 'Solstice Bloom', 'alb-3', 'Basalt & Mist', 'Chill', 'Chill', 245, 'synth://coastal-echo', 2024, 92, 1, 185, 86),
('sng-9', 'Tidal Drift', 'art-5', 'Solstice Bloom', 'alb-3', 'Basalt & Mist', 'Chill', 'Focus', 212, 'synth://tidal-drift', 2024, 87, 2, 146.8, 82),
('sng-10', 'Horizon Glass', 'art-5', 'Solstice Bloom', 'alb-3', 'Basalt & Mist', 'Chill', 'Chill', 229, 'synth://horizon-glass', 2024, 82, 3, 164.8, 90),
('sng-11', 'Rooftop Breeze', 'art-3', 'Mira Kapoor', 'alb-4', 'Paper Lanterns', 'Indie', 'Road Trip', 189, 'synth://rooftop-breeze', 2025, 93, 1, 261.6, 106),
('sng-12', 'Amber Polaroid', 'art-3', 'Mira Kapoor', 'alb-4', 'Paper Lanterns', 'Indie', 'Romantic', 201, 'synth://amber-polaroid', 2025, 88, 2, 293.7, 98),
('sng-13', 'July Metro', 'art-3', 'Mira Kapoor', 'alb-4', 'Paper Lanterns', 'Pop', 'Chill', 178, 'synth://july-metro', 2025, 85, 3, 246.9, 110),
('sng-14', 'Winter Nocturne', 'art-4', 'Kieran Vale', 'alb-5', 'Felt & Ivory', 'Classical', 'Focus', 256, 'synth://winter-nocturne', 2024, 90, 1, 220, 68),
('sng-15', 'Prelude in Amber', 'art-4', 'Kieran Vale', 'alb-5', 'Felt & Ivory', 'Classical', 'Focus', 214, 'synth://prelude-amber', 2024, 86, 2, 196, 72),
('sng-16', 'Silent Conservatory', 'art-4', 'Kieran Vale', 'alb-5', 'Felt & Ivory', 'Classical', 'Chill', 242, 'synth://silent-conservatory', 2024, 81, 3, 261.6, 64),
('sng-17', 'Copper Wire', 'art-6', 'Velvet Signal', 'alb-6', 'Static Horizon', 'Rock', 'Workout', 208, 'synth://copper-wire', 2025, 89, 1, 164.8, 132),
('sng-18', 'Silver Amplifier', 'art-6', 'Velvet Signal', 'alb-6', 'Static Horizon', 'Rock', 'Road Trip', 224, 'synth://silver-amplifier', 2025, 85, 2, 196, 126),
('sng-19', 'Redline Echo', 'art-6', 'Velvet Signal', 'alb-6', 'Static Horizon', 'Rock', 'Workout', 197, 'synth://redline-echo', 2025, 83, 3, 146.8, 136),
('sng-20', 'City Lights Fade', 'art-7', 'Rohan Verma', 'alb-7', 'Skyline Fever', 'Pop', 'Party', 186, 'synth://city-lights-fade', 2026, 96, 1, 261.6, 118),
('sng-21', 'Velvet Evening', 'art-7', 'Rohan Verma', 'alb-7', 'Skyline Fever', 'Pop', 'Romantic', 199, 'synth://velvet-evening', 2026, 91, 2, 220, 104),
('sng-22', 'Mirrorball Tempo', 'art-7', 'Rohan Verma', 'alb-7', 'Skyline Fever', 'Pop', 'Party', 192, 'synth://mirrorball-tempo', 2026, 89, 3, 293.7, 122),
('sng-23', 'Pacific Overpass', 'art-9', 'Soren & The Tide', 'alb-8', 'Highway 101', 'Road Trip', 'Road Trip', 215, 'synth://pacific-overpass', 2024, 88, 1, 246.9, 112),
('sng-24', 'Canyon Sunset', 'art-9', 'Soren & The Tide', 'alb-8', 'Highway 101', 'Indie', 'Road Trip', 204, 'synth://canyon-sunset', 2024, 84, 2, 220, 106),
('sng-25', 'Cadence 128', 'art-11', 'Pulse Foundry', 'alb-9', 'Kinetic State', 'Workout', 'Workout', 182, 'synth://cadence-128', 2026, 92, 1, 174.6, 128),
('sng-26', 'Sprint Protocol', 'art-11', 'Pulse Foundry', 'alb-9', 'Kinetic State', 'Electronic', 'Workout', 175, 'synth://sprint-protocol', 2026, 87, 2, 196, 134),
('sng-27', 'Theta Garden', 'art-12', 'Kabir Mehta', 'alb-10', 'Deep Tape Loops', 'Focus', 'Focus', 264, 'synth://theta-garden', 2025, 90, 1, 146.8, 74),
('sng-28', 'Analog Study IV', 'art-12', 'Kabir Mehta', 'alb-10', 'Deep Tape Loops', 'Focus', 'Chill', 248, 'synth://analog-study-4', 2025, 85, 2, 164.8, 70),
('sng-29', 'Glass Violin', 'art-8', 'Elena Rostova', 'alb-5', 'Felt & Ivory', 'Classical', 'Focus', 232, 'synth://glass-violin', 2025, 80, 4, 246.9, 76),
('sng-30', 'Electric Confetti', 'art-10', 'Zara Lin', 'alb-7', 'Skyline Fever', 'Party', 'Party', 184, 'synth://electric-confetti', 2026, 94, 4, 261.6, 124),
('sng-31', 'Warmth in December', 'art-13', 'Nadia Cruz', 'alb-2', 'Golden Window', 'Romantic', 'Romantic', 207, 'synth://warmth-december', 2025, 88, 4, 220, 82),
('sng-32', 'Suborbital Pulse', 'art-15', 'Tarek Vance', 'alb-1', 'After Dark', 'Electronic', 'Workout', 216, 'synth://suborbital-pulse', 2026, 87, 5, 185, 126),
('sng-33', 'Harbour Mist', 'art-14', 'Echo Harbour', 'alb-4', 'Paper Lanterns', 'Indie', 'Chill', 203, 'synth://harbour-mist', 2025, 83, 4, 246.9, 96)
on conflict (id) do nothing;
