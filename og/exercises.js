// openGym · Exercises tab (the exercise library), iPhone exploration.
// OGex.mount({ dir: 'search' | 'map' | 'yours', state, content, host })
// Board message: { ogState: 'browse'|'search'|'noresult'|'muscle'|'detail'|'never'|'long'|'add'|'create'|'new' }.
// Muscle highlights are white (never a routine color). Routine color only marks Push A / Pull A / Legs.
// The body map geometry is copied from og/v2.js bodyMap (not imported) and extended with forearms.
window.OGex = (() => {
  const ui = (n) => OGv2.ui(n);
  const P = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/>',
    star: '<path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.5l-5.1 2.7 1-5.6-4.1-4 5.7-.8Z"/>',
    chevL: '<path d="M15 5l-7 7 7 7"/>',
    chevR: '<path d="M9 5l7 7-7 7"/>',
    camera: '<path d="M4 8.5h3.2L9 6h6l1.8 2.5H20V19H4Z"/><circle cx="12" cy="13" r="3.3"/>',
    pencil: '<path d="M4 20h4L19 9l-4-4L4 16Z"/><path d="M13.5 6.5l4 4"/>',
    trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
    play: '<path d="M8 5.8v12.4a.9.9 0 0 0 1.4.8l9.6-6.2a.9.9 0 0 0 0-1.6L9.4 5a.9.9 0 0 0-1.4.8Z"/>'
  };
  const ic = (n, fill) => `<svg class="od-icon" viewBox="0 0 24 24" fill="${fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ── muscles, head to toe (the order the app lists them in) ──
  const MUS = { traps: 'Traps', shoulders: 'Shoulders', chest: 'Chest', back: 'Back', biceps: 'Biceps', triceps: 'Triceps', forearms: 'Forearms',
    abs: 'Abs', lowback: 'Lower back', glutes: 'Glutes', quads: 'Quads', hams: 'Hamstrings', calves: 'Calves' };
  const MUS_KEYS = Object.keys(MUS);
  const LIBRARY_SIZE = '5,632';

  // ── sample of the real catalogue (names shortened to match the Push A / Pull A / Legs story; descriptions and steps are the app's own) ──
  const CATALOG = [{"id":"0025","n":"Bench press","m":"chest","sm":["triceps","shoulders"],"eq":"Barbell","al":["barbell bench press","flat bench"],"d":"The classic flat bench press. Lower the bar to your chest and press it up to build the chest, shoulders and triceps.","s":["Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.","Grasp the barbell with an overhand grip slightly wider than shoulder-width apart.","Lift the barbell off the rack and hold it directly above your chest with your arms fully extended.","Lower the barbell slowly towards your chest, keeping your elbows tucked in.","Pause for a moment when the barbell touches your chest.","Push the barbell back up to the starting position by extending your arms.","Repeat for the desired number of repetitions."]},
    {"id":"0314","n":"Incline dumbbell press","m":"chest","sm":["shoulders","triceps"],"eq":"Dumbbell","al":["incline bench"],"d":"An incline dumbbell bench press. The raised bench shifts the work toward the upper chest.","s":["Set up an incline bench at a 45-degree angle.","Sit on the bench with your feet flat on the ground and your back pressed firmly against the bench.","Hold a dumbbell in each hand, palms facing forward, and lift them to shoulder height.","Slowly lower the dumbbells to the sides of your chest, keeping your elbows at a 90-degree angle.","Push the dumbbells back up to the starting position, fully extending your arms.","Repeat for the desired number of repetitions."]},
    {"id":"0091","n":"Overhead press","m":"shoulders","sm":["triceps"],"eq":"Barbell","al":["ohp","military press","seated overhead press"],"d":"A seated overhead press with the barbell. Builds the shoulders and triceps.","s":["Sit on a bench with your back straight and feet flat on the ground.","Hold the barbell with an overhand grip, slightly wider than shoulder-width apart.","Lift the barbell off the rack and bring it to shoulder level, with your elbows bent and palms facing forward.","Press the barbell overhead by extending your arms fully.","Pause for a moment at the top, then slowly lower the barbell back to shoulder level.","Repeat for the desired number of repetitions."]},
    {"id":"0334","n":"Lateral raise","m":"shoulders","sm":["traps"],"eq":"Dumbbell","al":["side raise"],"d":"The standard standing dumbbell lateral raise. Lifting the arms out to the sides builds the side delts.","s":["Stand with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing your body.","Keep your back straight and engage your core.","Raise your arms out to the sides until they are parallel to the floor, keeping a slight bend in your elbows.","Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"0201","n":"Triceps pushdown","m":"triceps","sm":["forearms"],"eq":"Cable","al":["pushdown"],"d":"The classic triceps pushdown on a high pulley with a straight bar. Elbows stay at your sides while the forearms drive down.","s":["Attach a straight bar to a high pulley cable machine.","Stand facing the machine with your feet shoulder-width apart and a slight bend in your knees.","Grasp the bar with an overhand grip, hands shoulder-width apart.","Keep your elbows close to your sides and your upper arms stationary.","Exhale and push the bar down until your elbows are fully extended.","Pause for a moment, then inhale and slowly return the bar to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"0251","n":"Dips","m":"chest","sm":["triceps","shoulders"],"eq":"Body weight","al":["chest dip"],"d":"A bodyweight dip with a forward lean on parallel bars. It targets the lower chest, triceps and shoulders.","s":["Position yourself on parallel bars with your arms fully extended and your body straight.","Lower your body by bending your elbows until your shoulders are below your elbows.","Push yourself back up to the starting position by straightening your arms.","Repeat for the desired number of repetitions."]},
    {"id":"0032","n":"Deadlift","m":"glutes","sm":["hams","lowback"],"eq":"Barbell","al":["conventional deadlift"],"d":"Lift the bar from the floor by driving the hips and legs until you stand tall. Trains the glutes, hamstrings and back.","s":["Stand with your feet shoulder-width apart and the barbell on the ground in front of you.","Bend your knees and hinge at the hips to lower your torso and grip the barbell with an overhand grip, hands slightly wider than shoulder-width apart.","Keep your back straight and chest lifted as you drive through your heels to lift the barbell off the ground, extending your hips and knees.","As you stand up straight, squeeze your glutes and keep your core engaged.","Lower the barbell back down to the ground by bending at the hips and knees, keeping your back straight.","Repeat for the desired number of repetitions."]},
    {"id":"0652","n":"Pull-up","m":"back","sm":["biceps","forearms"],"eq":"Body weight","al":["pullup"],"d":"You hang from a bar with an overhand grip and pull your chin above it. A classic builder for the lats and upper back.","s":["Hang from a pull-up bar with your palms facing away from you and your arms fully extended.","Engage your core and squeeze your shoulder blades together.","Pull your body up towards the bar by bending your elbows and bringing your chest towards the bar.","Pause at the top of the movement, then slowly lower your body back down to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"0027","n":"Barbell row","m":"back","sm":["biceps","shoulders"],"eq":"Barbell","al":["bent over row"],"d":"A hip-hinged row pulling the bar to your lower chest. A staple for the upper back and lats.","s":["Stand with your feet shoulder-width apart and knees slightly bent.","Bend forward at the hips while keeping your back straight and chest up.","Grasp the barbell with an overhand grip, hands slightly wider than shoulder-width apart.","Pull the barbell towards your lower chest by retracting your shoulder blades and squeezing your back muscles.","Pause for a moment at the top, then slowly lower the barbell back to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"5609","n":"Face pull","m":"shoulders","sm":["back","traps"],"eq":"Cable","al":["rope face pull"],"d":"Cable face pull to build the rear delts and strengthen the upper back.","s":["Set a cable at upper chest height with a handle.","Stand tall and pull toward your face.","Spread your hands apart at the end.","Squeeze your shoulder blades.","Return slowly."]},
    {"id":"0313","n":"Hammer curl","m":"biceps","sm":["forearms"],"eq":"Dumbbell","al":[],"d":"The standard hammer curl with the palms facing in. It trains the brachialis, biceps and forearms.","s":["Stand up straight with a dumbbell in each hand, palms facing your torso.","Keep your elbows close to your torso and rotate the palms of your hands until they are facing forward.","This will be your starting position.","Now, keeping the upper arms stationary, exhale and curl the weights while contracting your biceps.","Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.","Hold the contracted position for a brief pause as you squeeze your biceps.","Then, inhale and slowly begin to lower the dumbbells back to the starting position.","Repeat for the recommended amount of repetitions."]},
    {"id":"0031","n":"Barbell curl","m":"biceps","sm":["forearms"],"eq":"Barbell","al":["bicep curl"],"d":"The standard standing barbell curl. A simple and effective way to build the biceps.","s":["Stand up straight with your feet shoulder-width apart and hold a barbell with an underhand grip, palms facing forward.","Keep your elbows close to your torso and exhale as you curl the weights while contracting your biceps.","Continue to raise the bar until your biceps are fully contracted and the bar is at shoulder level.","Hold the contracted position for a brief pause as you squeeze your biceps.","Inhale as you slowly begin to lower the bar back to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"0043","n":"Back squat","m":"glutes","sm":["quads","hams","calves"],"eq":"Barbell","al":["squat","barbell full squat"],"d":"A deep back squat with the bar across the upper back. Builds the quads, glutes and overall leg strength.","s":["Stand with your feet shoulder-width apart, toes slightly turned out.","Hold the barbell across your upper back, resting it on your traps or rear delts.","Engage your core and keep your chest up as you begin to lower your body down.","Bend at the knees and hips, pushing your hips back and down as if sitting into a chair.","Lower yourself until your thighs are parallel to the ground or slightly below.","Keep your knees in line with your toes and your weight in your heels.","Drive through your heels to stand back up, extending your hips and knees.","Repeat for the desired number of repetitions."]},
    {"id":"0085","n":"Romanian deadlift","m":"hams","sm":["glutes","lowback"],"eq":"Barbell","al":["rdl"],"d":"Hinge at the hips with the bar close to your legs to feel a hamstring stretch, then stand tall. Trains the hamstrings and glutes.","s":["Stand with your feet shoulder-width apart and your toes pointing forward.","Hold the barbell with an overhand grip, hands slightly wider than shoulder-width apart.","Bend at the hips, keeping your back straight and your knees slightly bent.","Lower the barbell towards the ground, keeping it close to your body.","Feel the stretch in your hamstrings as you lower the barbell.","Once you feel a stretch in your hamstrings, push your hips forward and stand up straight.","Squeeze your glutes at the top of the movement.","Lower the barbell back down to the starting position and repeat for the desired number of repetitions."]},
    {"id":"0739","n":"Leg press","m":"quads","sm":["glutes","hams"],"eq":"Machine","al":["45 leg press","sled"],"d":"On a 45 degree sled, you press the platform away with your feet. Works the quads and glutes.","s":["Adjust the seat and footplate of the sled machine to a comfortable position.","Sit on the sled machine with your back against the backrest and your feet shoulder-width apart on the footplate.","Grip the handles on the sides of the seat for stability.","Push the footplate away from your body by extending your legs, keeping your heels on the footplate.","Continue pushing until your legs are almost fully extended, but without locking your knees.","Pause for a moment at the top of the movement, then slowly lower the footplate back towards your body by bending your knees.","Repeat for the desired number of repetitions."]},
    {"id":"0586","n":"Leg curl","m":"hams","sm":["calves"],"eq":"Machine","al":["lying leg curl"],"d":"Lying face down on a machine, you curl your heels toward your glutes. Isolates the hamstrings.","s":["Adjust the machine to fit your body and select the desired weight.","Lie face down on the machine with your legs straight and your heels against the padded lever.","Grasp the handles or the sides of the machine for stability.","Keeping your upper body stationary, exhale and curl your legs up as far as possible without lifting your hips off the pad.","Hold the contracted position for a brief pause as you squeeze your hamstrings.","Inhale and slowly lower the lever back to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"0605","n":"Calf raise","m":"calves","sm":[],"eq":"Machine","al":["standing calf raise"],"d":"Standing with pads on your shoulders, you rise onto your toes and lower back down. Isolates the calves.","s":["Adjust the machine to your height and stand with your feet shoulder-width apart.","Place your shoulders under the pads and hold onto the handles for stability.","Raise your heels as high as possible by extending your ankles.","Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"0289","n":"Dumbbell bench press","m":"chest","sm":["triceps","shoulders"],"eq":"Dumbbell","al":[],"d":"The classic dumbbell press on a flat bench. It builds the chest, shoulders and triceps with a good range of motion.","s":["Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.","Hold a dumbbell in each hand, with your palms facing forward and your arms extended above your chest.","Lower the dumbbells slowly to the sides of your chest, keeping your elbows at a 90-degree angle.","Pause for a moment, then push the dumbbells back up to the starting position, fully extending your arms.","Repeat for the desired number of repetitions."]},
    {"id":"0308","n":"Dumbbell fly","m":"chest","sm":["shoulders"],"eq":"Dumbbell","al":["chest fly"],"d":"The classic flat bench dumbbell fly. The arms open in an arc to stretch and squeeze the chest.","s":["Lie flat on a bench with a dumbbell in each hand, palms facing each other.","Extend your arms straight up over your chest, with a slight bend in your elbows.","Keeping a slight bend in your elbows, lower your arms out to the sides in a wide arc until you feel a stretch in your chest.","Pause for a moment, then reverse the movement and bring the dumbbells back up to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"1030","n":"Pec deck fly","m":"chest","sm":["shoulders"],"eq":"Machine","al":["pec deck","machine fly"],"d":"A machine fly where the arms sweep together in front, isolating the chest.","s":["Sit on the pec deck with your back flat and the arms at chest level.","Place your forearms or hands on the pads with elbows slightly bent.","Bring the arms together in front of your chest.","Squeeze for a moment, then open slowly until you feel a chest stretch.","Keep your shoulders down and back."]},
    {"id":"0030","n":"Close-grip bench press","m":"triceps","sm":["chest","shoulders"],"eq":"Barbell","al":["cgbp"],"d":"A bench press with a narrower grip that shifts more of the work to the triceps while still working the chest.","s":["Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.","Grasp the barbell with a close grip, slightly narrower than shoulder-width apart.","Unrack the barbell and lower it slowly towards your chest, keeping your elbows close to your body.","Pause for a moment when the barbell touches your chest.","Push the barbell back up to the starting position, fully extending your arms.","Repeat for the desired number of repetitions."]},
    {"id":"0283","n":"Diamond push-up","m":"triceps","sm":["chest","shoulders"],"eq":"Body weight","al":["pushup"],"d":"A push-up with the hands forming a diamond under the chest. It puts heavy focus on the triceps.","s":["Start in a high plank position with your hands close together, forming a diamond shape with your thumbs and index fingers.","Keep your body in a straight line from head to toe, engaging your core and glutes.","Lower your chest towards the diamond shape formed by your hands, keeping your elbows close to your body.","Pause for a moment at the bottom, then push yourself back up to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"0060","n":"Skull crusher","m":"triceps","sm":[],"eq":"Barbell","al":["lying triceps extension"],"d":"The classic skull crusher: lower the bar to the forehead and extend the arms. Isolates the triceps.","s":["Lie flat on a bench with your feet flat on the ground and your head at the end of the bench.","Hold the barbell with an overhand grip, hands shoulder-width apart, and extend your arms straight up over your chest.","Keeping your upper arms stationary, slowly lower the barbell towards your forehead by bending your elbows.","Pause for a moment when the barbell is just above your forehead, then extend your arms back up to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"2137","n":"Arnold press","m":"shoulders","sm":["triceps"],"eq":"Dumbbell","al":[],"d":"A seated dumbbell press that rotates the palms from facing you to facing forward as you lift. Hits all three heads of the shoulder.","s":["Sit on a bench with back support and hold a dumbbell in each hand at shoulder level, palms facing your body and elbows bent.","Press the dumbbells upward until your arms are fully extended and your palms are facing forward.","Rotate your wrists as you lift, so that your palms are facing forward at the top of the movement.","Pause for a moment at the top, then slowly lower the dumbbells back to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"0426","n":"Standing dumbbell press","m":"shoulders","sm":["triceps"],"eq":"Dumbbell","al":["dumbbell overhead press"],"d":"Standing, you press dumbbells from your shoulders to overhead. It builds the shoulders, triceps and trunk stability.","s":["Stand with your feet shoulder-width apart, holding a dumbbell in each hand at shoulder level with your palms facing forward.","Press the dumbbells upward until your arms are fully extended overhead.","Pause for a moment at the top, then slowly lower the dumbbells back down to shoulder level.","Repeat for the desired number of repetitions."]},
    {"id":"3914","n":"Cable rear delt row","m":"shoulders","sm":["back","traps"],"eq":"Cable","al":["rear delt"],"d":"A row with wide elbows on the cable machine that targets the rear delts.","s":["Set a cable at chest height with a handle or rope.","Hold it with your arms extended.","Step back and lean slightly.","Pull the handle toward your upper chest with your elbows flared out.","Squeeze your rear delts.","Return slowly."]},
    {"id":"0584","n":"Machine lateral raise","m":"shoulders","sm":[],"eq":"Machine","al":[],"d":"On a lever machine, you raise your arms out to the sides against resistance. Isolates the side delts.","s":["Adjust the seat height and position yourself on the machine with your back against the pad.","Grasp the handles with an overhand grip and keep your arms straight.","Exhale and raise your arms out to the sides until they are parallel to the floor.","Pause for a moment at the top, then inhale and slowly lower your arms back to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"5074","n":"Landmine press","m":"shoulders","sm":["chest","triceps"],"eq":"Landmine","al":[],"d":"Press the end of an angled barbell up and forward. The arc is friendly to the shoulder and trains pressing and trunk stability.","s":["Anchor one end of a barbell and hold the other end at your shoulder with both hands.","Stand with feet staggered and core braced.","Press the bar up and forward until your arms are straight.","Lower it back to your shoulder under control.","Keep your ribs down and avoid leaning back."]},
    {"id":"0095","n":"Barbell shrug","m":"traps","sm":["forearms"],"eq":"Barbell","al":["shrug"],"d":"Shrug the shoulders toward your ears while holding the bar. Builds the upper traps.","s":["Stand with your feet shoulder-width apart and hold a barbell in front of you with an overhand grip.","Keep your arms straight and your back straight throughout the exercise.","Lift your shoulders up towards your ears as high as possible, squeezing your traps at the top.","Hold for a moment, then slowly lower your shoulders back down to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"1326","n":"Chin-up","m":"back","sm":["biceps"],"eq":"Body weight","al":["chinup"],"d":"Hang from a bar with an underhand grip and pull until your chin clears it. A classic builder of the lats and biceps.","s":["Hang from a pull-up bar with your palms facing towards you and your hands shoulder-width apart.","Engage your core and pull your body up towards the bar, leading with your chest.","Continue pulling until your chin is above the bar.","Pause for a moment at the top, then slowly lower your body back down to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"0198","n":"Lat pulldown","m":"back","sm":["biceps"],"eq":"Cable","al":["pulldown"],"d":"A classic seated cable pulldown with a wide bar. You pull to the chest to train the lats and the muscles around the shoulder blades.","s":["Adjust the cable pulldown machine so that the seat is at a comfortable height and the knee pad is secured.","Sit on the seat with your back straight and your feet flat on the ground.","Grasp the cable bar with an overhand grip, slightly wider than shoulder-width apart.","Lean back slightly and engage your core.","Pull the cable bar down towards your chest, squeezing your shoulder blades together.","Pause for a moment at the bottom of the movement, then slowly release the bar back to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"0180","n":"Seated cable row","m":"back","sm":["biceps"],"eq":"Cable","al":["low row"],"d":"Seated cable row from a low pulley. You pull the handles to your torso and squeeze the shoulder blades, building the mid back.","s":["Sit on the machine with your feet flat on the footrests and your knees slightly bent.","Grasp the handles with an overhand grip, palms facing down.","Keep your back straight and lean slightly forward, maintaining a slight bend in your elbows.","Pull the handles towards your body, squeezing your shoulder blades together.","Pause for a moment at the peak of the movement, then slowly release the handles back to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"0868","n":"Cable curl","m":"biceps","sm":["forearms"],"eq":"Cable","al":[],"d":"A standing curl using a cable and an underhand grip. It keeps constant tension on the biceps.","s":["Stand facing the cable machine with your feet shoulder-width apart.","Grasp the cable attachment with an underhand grip, palms facing up.","Keep your elbows close to your sides and your upper arms stationary.","Exhale and curl the cable attachment towards your shoulders, contracting your biceps.","Pause for a moment at the top of the movement, squeezing your biceps.","Inhale and slowly lower the cable attachment back to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"0070","n":"Preacher curl","m":"biceps","sm":["forearms"],"eq":"Barbell","al":[],"d":"A curl with the upper arms resting on a preacher pad, which keeps the focus on the biceps.","s":["Sit on a preacher bench with your upper arms resting on the pad and your chest against the support.","Grasp the barbell with an underhand grip, slightly wider than shoulder-width apart.","Keeping your upper arms stationary, exhale and curl the barbell up towards your shoulders.","Pause for a moment at the top, squeezing your biceps.","Inhale and slowly lower the barbell back down to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"0042","n":"Front squat","m":"quads","sm":["glutes","hams"],"eq":"Barbell","al":["squat"],"d":"The barbell front squat with the bar resting on the front of the shoulders. Heavy on the quads and core.","s":["Start by standing with your feet shoulder-width apart, toes slightly turned out.","Hold the barbell in front of your shoulders, resting it on your collarbone and shoulders.","Engage your core and keep your chest up as you lower your body down into a squat position, pushing your hips back and bending your knees.","Lower until your thighs are parallel to the ground, or as low as you can comfortably go.","Pause for a moment at the bottom, then push through your heels to return to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"5516","n":"Hack squat","m":"quads","sm":["glutes"],"eq":"Machine","al":["squat machine"],"d":"Plate-loaded hack squat machine that lets you load the quads and glutes with back support.","s":["Set your shoulders under the pads and feet shoulder width on the platform.","Release the safety handles.","Lower until your thighs are at least parallel to the platform.","Press through your whole foot to stand.","Do not lock your knees hard at the top."]},
    {"id":"0585","n":"Leg extension","m":"quads","sm":[],"eq":"Machine","al":[],"d":"Seated on a machine, you straighten your legs against a pad. A simple quad builder.","s":["Adjust the seat height and backrest of the machine to fit your body.","Sit on the machine with your back against the backrest and your feet on the footpad.","Grasp the handles or sidebars for stability.","Extend your legs forward by straightening your knees, lifting the weight.","Pause for a moment at the top, then slowly lower the weight back to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"3743","n":"Bulgarian split squat","m":"quads","sm":["glutes","hams"],"eq":"Body weight","al":["split squat"],"d":"A single-leg squat with your rear foot resting on a chair, which builds strength and balance.","s":["Stand facing away from a chair and rest the top of one foot on it.","Step your front foot forward so it is stable.","Lower your back knee toward the floor.","Push through your front foot to stand.","Finish your reps, then switch legs."]},
    {"id":"1060","n":"Hip thrust","m":"glutes","sm":["hams"],"eq":"Barbell","al":["glute bridge"],"d":"A bench-supported bridge with a barbell across your hips. It is a go-to move for building strong glutes.","s":["Sit on the floor with your upper back against a bench and a padded barbell over your hips.","Plant your feet hip-width apart and drive through your heels.","Lift your hips until your torso is level with the floor.","Squeeze your glutes at the top and keep your chin tucked.","Lower your hips under control.","Repeat without arching your lower back."]},
    {"id":"0811","n":"Trap bar deadlift","m":"glutes","sm":["quads","hams","lowback"],"eq":"Trap bar","al":["hex bar"],"d":"A deadlift standing inside a hex bar, lifting by extending the hips and knees. It builds the glutes, quads and back with a friendly lifting position.","s":["Stand with your feet shoulder-width apart and the trap bar on the ground in front of you.","Bend at the hips and knees to lower yourself down and grip the handles of the trap bar with an overhand grip.","Keep your back straight and chest up as you begin to lift the trap bar off the ground by extending your hips and knees.","As you lift, focus on driving through your heels and squeezing your glutes at the top of the movement.","Lower the trap bar back down to the ground by bending at the hips and knees, keeping your back straight throughout the movement.","Repeat for the desired number of repetitions."]},
    {"id":"0117","n":"Sumo deadlift","m":"glutes","sm":["hams","quads"],"eq":"Barbell","al":[],"d":"A deadlift with a wide stance and narrow grip. Works the glutes, hamstrings and inner thighs.","s":["Stand with your feet wider than shoulder-width apart, toes pointing outwards.","Place a barbell on the ground in front of you, centered between your feet.","Bend your knees and lower your hips, keeping your back straight and chest up, to grip the barbell with an overhand grip.","Engage your core and drive through your heels to lift the barbell off the ground, extending your hips and knees simultaneously.","As you lift, keep your chest up and back straight, and push your hips forward to fully engage your glutes.","Pause for a moment at the top, then slowly lower the barbell back down to the starting position, maintaining control throughout the movement.","Repeat for the desired number of repetitions."]},
    {"id":"4295","n":"Dumbbell walking lunge","m":"quads","sm":["glutes","hams"],"eq":"Dumbbell","al":["lunges"],"d":"Lunging forward step after step with a dumbbell in each hand. It builds leg and glute strength and balance.","s":["Stand tall holding a dumbbell in each hand at your sides.","Step forward with one leg and lower until both knees are about 90 degrees.","Keep your torso upright and your front knee over your ankle.","Push through the front foot and bring the back leg forward into the next step.","Alternate legs for the desired number of steps."]},
    {"id":"0549","n":"Kettlebell swing","m":"glutes","sm":["hams","lowback"],"eq":"Kettlebell","al":[],"d":"A hip hinge move where you swing a kettlebell to chest height using your hips. Great for glutes, hamstrings and posterior chain power.","s":["Stand with your feet shoulder-width apart, toes pointed slightly outward.","Hold the kettlebell with both hands in front of your body, arms extended.","Bend your knees slightly and hinge at the hips, pushing your butt back.","Swing the kettlebell back between your legs, keeping your arms straight and maintaining a flat back.","Drive your hips forward and swing the kettlebell up to shoulder height, using the momentum generated by your hips.","Allow the kettlebell to swing back down between your legs and repeat the movement for the desired number of repetitions."]},
    {"id":"0463","n":"Front plank","m":"abs","sm":[],"eq":"Body weight","al":["plank"],"d":"The classic forearm plank. Holding a straight line from head to heels builds core endurance and stability.","s":["Lie face down and prop yourself on your forearms, elbows under your shoulders.","Lift your hips and knees off the floor, resting on your toes.","Keep your body in a straight line from head to heels.","Squeeze your abs and glutes.","Hold for 20-60 seconds while breathing steadily.","Don't let your hips sag or pike up."]},
    {"id":"0472","n":"Hanging leg raise","m":"abs","sm":["forearms"],"eq":"Body weight","al":[],"d":"Hanging from a bar, you raise your legs in front of you. It works the lower abs and hip flexors.","s":["Hang from a pull-up bar with your arms fully extended and your palms facing away from you.","Engage your core and lift your legs up in front of you, keeping them straight.","Continue lifting until your legs are parallel to the ground or as high as you can comfortably go.","Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Repeat for the desired number of repetitions."]},
    {"id":"5813","n":"Back extension","m":"lowback","sm":["glutes","hams"],"eq":"Body weight","al":["hyperextension"],"d":"A back extension on a 45 degree bench with arms crossed at the chest. It strengthens the lower back and glutes.","s":["Set the pad at hip height and hook your heels under the rollers.","Cross your arms over your chest.","Lower your torso with a straight back.","Raise yourself until your body forms a straight line.","Squeeze your glutes at the top and lower slowly."]},
    {"id":"1372","n":"Barbell calf raise","m":"calves","sm":[],"eq":"Barbell","al":[],"d":"Stand with a barbell on your upper back and rise onto your toes. It builds the calves and ankle strength.","s":["Stand with your feet shoulder-width apart and place a barbell across your upper back.","Raise your heels off the ground as high as possible, using only your toes.","Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Repeat for the desired number of repetitions."]}];
  const CUSTOM0 = [{ id: 'c1', n: 'Single-arm half-kneeling landmine press with a pause at the bottom', m: 'shoulders', sm: ['chest', 'triceps'], eq: 'Landmine', al: [], custom: true,
    d: 'My own note: pause two seconds with the bar at the shoulder, then press.', s: [] }];

  // ── the user's plan and log (same story as Today: today is Wed 28 Oct, Push A is today) ──
  const ROUT = [
    { k: 'push', name: 'Push A', ids: ['0025', '0314', '0091', '0334', '0201', '0251'] },
    { k: 'pull', name: 'Pull A', ids: ['0032', '0652', '0027', '5609', '0313', '0031'] },
    { k: 'legs', name: 'Legs', ids: ['0043', '0085', '0739', '0586', '0605'] }
  ];
  const DATES = {
    push: ['16 Sep', '23 Sep', '30 Sep', '7 Oct', '14 Oct', '21 Oct'],
    pull: ['18 Sep', '25 Sep', '2 Oct', '9 Oct', '16 Oct', '23 Oct'],
    legs: ['10 Oct', '12 Oct', '17 Oct', '19 Oct', '24 Oct', '26 Oct']
  };
  const TOTAL = { push: 15, pull: 14, legs: 27 };   // all-time, matching og/progress.js (history from Mon 6 Jul)
  // oldest → newest working weight (kg) or, for body weight work, top reps; plus the reps pattern
  const LOG = {
    '0314': [[24, 24, 26, 26, 26, 28], [8, 8, 7]], '0091': [[40, 40, 42.5, 42.5, 45, 45], [6, 6, 5]],
    '0334': [[10, 10, 10, 12, 12, 12], [12, 12, 10]], '0201': [[27.5, 27.5, 30, 30, 32.5, 32.5], [12, 10, 10]],
    '0251': [[8, 9, 10, 10, 11, 12], 'bw'], '0032': [[125, 130, 130, 135, 135, 140], [5, 5, 4]],
    '0652': [[7, 8, 8, 9, 9, 10], 'bw'], '0027': [[60, 62.5, 62.5, 65, 67.5, 70], [8, 8, 7]],
    '5609': [[20, 20, 22.5, 22.5, 25, 25], [15, 12, 12]], '0313': [[14, 14, 14, 16, 16, 16], [10, 10, 8]],
    '0031': [[30, 30, 32.5, 32.5, 35, 35], [8, 8, 7]], '0043': [[100, 100, 102.5, 105, 107.5, 110], [5, 5, 5]],
    '0085': [[80, 80, 85, 85, 87.5, 90], [8, 8, 8]], '0739': [[170, 180, 180, 190, 190, 200], [12, 10, 10]],
    '0586': [[42.5, 45, 45, 47.5, 47.5, 50], [12, 10, 10]], '0605': [[70, 70, 72.5, 75, 77.5, 80], [15, 12, 12]]
  };
  const rc = (k) => k === 'new' ? 'var(--text-2)' : `var(--${k})`;
  const kg = (n) => (n % 1 ? n.toFixed(1) : String(n));
  function buildHistory() {
    const H = {};
    // Bench press, set by set
    const bench = [[65, [6, 6, 5]], [67.5, [5, 5, 5]], [67.5, [6, 6, 5]], [70, [5, 5, 4]], [70, [6, 5, 5]], [72.5, [5, 5, 4]]];
    const mk = (rows, dates, total, bw) => {
      let max = -1;
      const ss = rows.map(([v, reps], i) => { const pr = i > 0 && v > max; max = Math.max(max, v); return { d: dates[i], v, reps, pr }; });
      return { bw, total, ss: ss.reverse(), best: max };
    };
    H['0025'] = mk(bench, DATES.push, TOTAL.push, false);
    ROUT.forEach((r) => r.ids.forEach((id) => {
      if (!LOG[id]) return;
      const [vals, pat] = LOG[id], bw = pat === 'bw';
      H[id] = mk(vals.map((v) => [v, bw ? [v, v - 2, v - 3] : pat]), DATES[r.k], TOTAL[r.k], bw);
    }));
    H.c1 = mk([[20, [8, 8, 7]], [22.5, [8, 8, 7]]], ['14 Oct', '21 Oct'], 2, false);
    return H;
  }

  // ── body map (geometry from og/v2.js bodyMap; forearms added; white highlights) ──
  function fig(x, back, cls, act) {
    const a = (m) => act ? ` data-act="mus" data-m="${m}"` : '';
    const r = (m, shape) => shape.replace(/^<(\w+)/, `<$1 class="${cls(m)}"${a(m)}`);
    return `<g transform="translate(${x} 0)">
      <circle class="head" cx="50" cy="16" r="11"/>
      <rect class="base" x="45" y="27" width="10" height="7" rx="3"/>
      ${back ? r('traps', '<rect x="36" y="32" width="28" height="12" rx="5"/>') : ''}
      ${r('shoulders', '<ellipse cx="27" cy="44" rx="9.5" ry="8.5"/>')}${r('shoulders', '<ellipse cx="73" cy="44" rx="9.5" ry="8.5"/>')}
      ${back
        ? r('back', '<rect x="32" y="46" width="36" height="30" rx="9"/>') + r('lowback', '<rect x="39" y="78" width="22" height="16" rx="5"/>')
        : r('chest', '<rect x="32" y="36" width="17.5" height="20" rx="6"/>') + r('chest', '<rect x="50.5" y="36" width="17.5" height="20" rx="6"/>')
          + r('abs', '<rect x="40" y="58" width="20" height="36" rx="6"/>') + '<rect class="base" x="32" y="58" width="7" height="32" rx="3"/><rect class="base" x="61" y="58" width="7" height="32" rx="3"/>'}
      ${r(back ? 'triceps' : 'biceps', '<ellipse cx="21" cy="65" rx="6" ry="12"/>')}${r(back ? 'triceps' : 'biceps', '<ellipse cx="79" cy="65" rx="6" ry="12"/>')}
      ${r('forearms', '<ellipse cx="17" cy="91" rx="5" ry="12"/>')}${r('forearms', '<ellipse cx="83" cy="91" rx="5" ry="12"/>')}
      ${back ? r('glutes', '<rect x="33" y="96" width="34" height="18" rx="7"/>') : '<rect class="base" x="33" y="96" width="34" height="13" rx="7"/>'}
      ${r(back ? 'hams' : 'quads', `<rect x="33" y="${back ? 116 : 111}" width="15.5" height="${back ? 42 : 47}" rx="7"/>`)}${r(back ? 'hams' : 'quads', `<rect x="51.5" y="${back ? 116 : 111}" width="15.5" height="${back ? 42 : 47}" rx="7"/>`)}
      ${r('calves', '<rect x="35" y="162" width="11" height="38" rx="5"/>')}${r('calves', '<rect x="54" y="162" width="11" height="38" rx="5"/>')}
      <text class="cap" x="50" y="218">${back ? 'BACK' : 'FRONT'}</text>
    </g>`;
  }
  const clsFor = (main, helpers) => (m) => m === main ? 'lit' : helpers.includes(m) ? 'half' : 'base';
  const bodyMap = (main, helpers = [], act = false) => `<svg class="xm" viewBox="0 0 215 224" aria-hidden="true">${fig(0, false, clsFor(main, helpers), act)}${fig(115, true, clsFor(main, helpers), act)}</svg>`;
  const CROP = { chest: [0, '10 8 80 80'], shoulders: [0, '5 4 90 90'], abs: [0, '10 38 80 80'], biceps: [0, '0 25 80 80'], forearms: [0, '0 47 80 80'],
    quads: [0, '10 96 80 80'], calves: [1, '10 136 80 80'], traps: [1, '10 0 80 80'], back: [1, '10 22 80 80'], lowback: [1, '10 46 80 80'],
    triceps: [1, '0 25 80 80'], glutes: [1, '10 66 80 80'], hams: [1, '10 98 80 80'] };
  // list rows show a still of the exercise's animation (stand-in figure from og/anim.js); your own exercises have no clip
  const still = (e) => e.custom ? `<span class="xr-th" aria-hidden="true">${thumb(e.m, true)}</span>` : `<span class="xr-th is-anim" aria-hidden="true">${OGAnim.figure(e.n, { tag: false, still: true })}</span>`;
  const thumb = (m, bare) => { const [b, vb] = CROP[m]; const svg = `<svg class="xm" viewBox="${vb}">${fig(0, !!b, clsFor(m, []), false)}</svg>`; return bare ? svg : `<span class="xr-th" aria-hidden="true">${svg}</span>`; };

  // ── search: every word must start a word of the name, an alias, the muscle or the equipment;
  //    a word that matches nothing at all is allowed one or two typos (as the app does) ──
  const norm = (t) => t.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const corpus = (e) => norm([e.n, ...e.al, MUS[e.m], e.eq].join(' ')).split(' ');
  function dist(a, b) {
    const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) { d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); }
    return d[m][n];
  }
  const typos = (t) => t.length >= 7 ? 2 : t.length >= 4 ? 1 : 0;
  const near = (tok, w) => w.startsWith(tok) || (typos(tok) && dist(tok, w.slice(0, tok.length + 1)) <= typos(tok)) || (typos(tok) && dist(tok, w) <= typos(tok));
  function search(list, q, all) {
    const toks = norm(q).split(' ').filter(Boolean);
    if (!toks.length) return { hits: list, similar: [] };
    const exact = new Set(toks.filter((t) => all.some((e) => corpus(e).some((w) => w.startsWith(t)))));
    const hit = (e, t) => corpus(e).some((w) => exact.has(t) ? w.startsWith(t) : near(t, w));
    const hits = list.filter((e) => toks.every((t) => hit(e, t)));
    // close but not exact: most of the words (or one typo further), under the results
    const need = Math.max(1, Math.ceil(toks.length / 2));
    const similar = toks.length < 2 && hits.length ? [] : list.filter((e) => !hits.includes(e) && toks.filter((t) => corpus(e).some((w) => near(t, w))).length >= need);
    return { hits, similar };
  }

  // ── states ──
  const STATES = {
    browse: { label: 'Browsing' }, search: { label: 'Searching', q: 'press' }, noresult: { label: 'No exact match', q: 'sissy squat' },
    muscle: { label: 'Filtered by muscle', mus: 'shoulders' }, detail: { label: 'Exercise with history', sheet: ['detail', '0025'] },
    never: { label: 'Never done', sheet: ['detail', '3914'] }, long: { label: 'Long names', q: 'landmine' },
    add: { label: 'Add to a routine', sheet: ['add', '0025'] }, create: { label: 'Create your own', q: 'sissy squat', sheet: ['create', 'Sissy squat'] },
    new: { label: 'New user', fresh: true }
  };

  function mount({ dir, state, open, content, host }) {
    dir = ['search', 'map', 'yours'].includes(dir) ? dir : 'search';
    host.classList.add('og', 'p-ios');
    const toastEl = document.createElement('div');
    toastEl.className = 'toast'; toastEl.setAttribute('role', 'status');
    host.append(toastEl);
    let toastT;
    const toast = (m) => { toastEl.textContent = m; toastEl.classList.add('in'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('in'), 2600); };

    let s;
    const all = () => [...s.custom, ...CATALOG];
    const byId = (id) => all().find((e) => e.id === id);
    const inPlan = (id) => s.rout.some((r) => r.ids.includes(id));
    const isYours = (e) => e.custom || inPlan(e.id) || !!s.hist[e.id] || s.fav.has(e.id);
    const alpha = (a, b) => a.n.localeCompare(b.n);

    function reset(key) {
      const st = STATES[key] || STATES.browse;
      layers.slice().forEach((l) => l.close(true));
      s = { key, q: st.q || '', mus: st.mus || '', eq: '', fresh: !!st.fresh, plan: 'push', searchOpen: !!st.q,
        fav: new Set(st.fresh ? [] : ['0025', '0652']), custom: st.fresh ? [] : CUSTOM0.map((c) => ({ ...c })),
        hist: st.fresh ? {} : buildHistory(), rout: st.fresh ? [] : ROUT.map((r) => ({ ...r, ids: r.ids.slice() })) };
      draw();
      if (st.sheet) {
        const [kind, arg] = st.sheet;
        if (kind === 'detail') openDetail(arg);
        if (kind === 'add') openAdd(arg);
        if (kind === 'create') openCreate(null, arg);
      }
    }

    // ── the filtered list every direction uses ──
    function filtered() {
      let list = all();
      if (s.mus) list = list.filter((e) => e.m === s.mus || e.sm.includes(s.mus));
      const { hits, similar } = search(list, s.q, all());
      const eqCount = {};
      hits.forEach((e) => { if (e.eq) eqCount[e.eq] = (eqCount[e.eq] || 0) + 1; });
      const eqOpts = Object.keys(eqCount).sort((a, b) => eqCount[b] - eqCount[a] || a.localeCompare(b));
      const eqOn = eqOpts.includes(s.eq) ? s.eq : '';   // a choice the search narrowed away is ignored, never a dead end
      let res = eqOn ? hits.filter((e) => e.eq === eqOn) : hits;
      const searching = !!s.q.trim();
      res = res.slice().sort((a, b) => {
        if (s.mus) { const am = a.m === s.mus ? 0 : 1, bm = b.m === s.mus ? 0 : 1; if (am !== bm) return am - bm; }
        const af = s.fav.has(a.id) ? 0 : 1, bf = s.fav.has(b.id) ? 0 : 1; if (af !== bf) return af - bf;
        if (searching) { const ay = isYours(a) ? 0 : 1, by = isYours(b) ? 0 : 1; if (ay !== by) return ay - by; }
        return alpha(a, b);
      });
      return { res, similar: similar.sort(alpha).slice(0, 12), eqOpts, eqOn, narrowed: !!(searching || s.mus || eqOn) };
    }

    // ── pieces ──
    const best = (id) => { const h = s.hist[id]; return h ? `<span class="xr-best"><span class="num">${kg(h.best)}</span><small>${h.bw ? 'reps' : 'kg'}</small></span>` : ''; };
    const sub = (e) => `${MUS[e.m]}${e.eq ? ` · ${esc(e.eq)}` : ''}${e.custom ? ' · Your own' : ''}`;
    const row = (e) => `<li class="xr">
      <button class="xr-main" data-act="open" data-id="${e.id}">${still(e)}
        <span class="xr-tx"><span class="xr-n od-clamp-2">${s.fav.has(e.id) ? `<span class="xr-fav" aria-label="Favourite">${ic('star', true)}</span>` : ''}${esc(e.n)}</span>
        <span class="xr-s od-truncate">${sub(e)}</span></span>${best(e.id)}</button>
      <button class="xr-add" data-act="add" data-id="${e.id}" aria-label="Add ${esc(e.n)} to a routine">${ui('plus')}</button></li>`;
    const createRow = (label = 'Create your own exercise', hint = 'A name and a muscle is all it needs') => `<li class="xr"><button class="xr-main xr-new" data-act="create">
      <span class="xr-th plus" aria-hidden="true">${ui('plus')}</span><span class="xr-tx"><span class="xr-n od-clamp-2">${esc(label)}</span><span class="xr-s">${esc(hint)}</span></span></button></li>`;
    const group = (title, rows, right) => rows ? `<section class="xg"><div class="xg-h"><h2 class="xg-t">${title}</h2>${right ? `<span class="xg-r">${right}</span>` : ''}</div><ul class="xl" role="list">${rows}</ul></section>` : '';
    const hasBest = (list) => list.some((e) => s.hist[e.id]) ? 'Your best' : '';
    const chip = (act, val, on, label, extra = '') => `<button class="xc${on ? ' on' : ''}" data-act="${act}" data-v="${val}" aria-pressed="${on}"${extra}>${label}</button>`;
    const musRail = () => `<div class="xc-rail od-rail" data-rail="mus" role="group" aria-label="Muscle">${chip('mus', '', !s.mus, 'All')}${MUS_KEYS.map((m) => chip('mus', m, s.mus === m, MUS[m])).join('')}</div>`;
    const eqRail = (f) => f.eqOpts.length > 1 ? `<div class="xc-rail od-rail sm" data-rail="eq" role="group" aria-label="Equipment">${chip('eq', '', !f.eqOn, 'Any equipment')}${f.eqOpts.map((x) => chip('eq', x, f.eqOn === x, esc(x))).join('')}</div>` : '';
    const searchField = (f, cancel) => `<div class="xs${s.q ? ' has-q' : ''}" role="search">
        <label class="xs-f">${ic('search')}<span class="sr">Search exercises</span>
          <input type="search" data-in="q" value="${esc(s.q)}" placeholder="Search exercises" autocomplete="off" enterkeyhint="search" />
          <span class="xs-n num" data-count role="status" aria-live="polite">${showCount(f) ? f.res.length : ''}</span>
          <button class="xs-x" data-act="clear" aria-label="Clear search" ${s.q ? '' : 'hidden'}>${ui('x')}</button></label>
        ${cancel ? '<button class="xs-cancel" data-act="cancel-search">Cancel</button>' : ''}</div>`;
    // the live count only where nothing else on screen states it (a muscle header already says how many)
    const showCount = (f) => !!(s.q.trim() || (dir === 'search' && f.narrowed));
    const countLine = () => s.custom.length ? `${LIBRARY_SIZE} exercises · ${s.custom.length} of your own` : `${LIBRARY_SIZE} exercises, each with an animation`;
    const mockNote = '';   // the 'sample of 47' note lives on the board, not in the app screen

    const activeMus = () => s.mus ? `<div class="x-active"><span class="x-active-l">Only</span><button class="xc on" data-act="unmus" aria-label="Remove the ${MUS[s.mus]} filter">${MUS[s.mus]}${ui('x')}</button></div>` : '';
    function results(f, { split } = {}) {
      let out = '';
      const q = s.q.trim();
      if (f.res.length) {
        if (split) {
          const yours = f.res.filter(isYours), lib = f.res.filter((e) => !isYours(e));
          out += group('Yours', yours.map(row).join(''), hasBest(yours));
          out += group(s.mus && !q ? `More for ${MUS[s.mus].toLowerCase()}` : 'From the library', lib.map(row).join(''));
        } else if (s.mus && !q) {
          const main = f.res.filter((e) => e.m === s.mus), help = f.res.filter((e) => e.m !== s.mus);
          out += group(`Mainly ${MUS[s.mus].toLowerCase()}`, main.map(row).join(''), hasBest(main));
          out += group(`Also works ${MUS[s.mus].toLowerCase()}`, help.map(row).join(''), hasBest(help) && !hasBest(main) ? 'Your best' : '');
        } else out += group('Results', f.res.map(row).join(''), hasBest(f.res));
      }
      if (!f.res.length) {
        const where = [s.mus && MUS[s.mus], f.eqOn].filter(Boolean).join(', ');
        out += `<div class="x-empty" role="status"><p class="x-empty-t">${q ? `No exact match for “${esc(q)}”` : 'Nothing here yet'}${where ? ` in ${esc(where)}` : ''}.</p>
          <p class="x-empty-s">${f.similar.length ? 'These come close. Or make it your own exercise.' : 'Check the spelling, try fewer words, or make it your own exercise.'}</p>
          <div class="x-empty-a">${where ? '<button class="x-ghost" data-act="widen">Search all muscles</button>' : ''}</div></div>`;
      }
      if (f.similar.length) out += group(f.res.length ? 'Similar exercises' : 'Close matches', f.similar.map(row).join(''), hasBest(f.similar));
      if (q) out += `<ul class="xl solo" role="list">${createRow(`Create “${q}”`, 'Make it your own exercise')}</ul>`;
      return out;
    }

    // ── direction A · search first ──
    function bodyA() {
      const f = filtered();
      let out = musRail() + (f.narrowed ? eqRail(f) : '');
      if (f.narrowed) return out + results(f) + mockNote;
      const favs = all().filter((e) => s.fav.has(e.id)).sort(alpha), rest = all().filter((e) => !s.fav.has(e.id)).sort(alpha);
      out += group('Favourites', favs.map(row).join(''), hasBest(favs));
      out += group(favs.length ? 'All exercises' : 'All exercises, A to Z', rest.map(row).join(''), hasBest(rest));
      out += `<ul class="xl solo" role="list">${createRow()}</ul>`;
      return out + mockNote;
    }

    // ── direction B · body map ──
    const count = (m) => all().filter((e) => e.m === m || e.sm.includes(m)).length;
    function bodyB() {
      const f = filtered();
      if (s.searchOpen) return activeMus() + eqRail(f) + (s.q.trim() ? results(f) : `<p class="x-hint">Type a name, a muscle or a piece of equipment.</p>`) + (s.q.trim() ? mockNote : '');
      if (!s.mus) {
        return `<section class="xb-map" aria-label="Body map"><div class="xb-fig">${bodyMap('', [], true)}</div>
            <p class="x-hint">Tap a muscle, or pick one below.</p></section>
          <ul class="xb-grid" role="list">${MUS_KEYS.map((m) => `<li><button class="xb-m" data-act="mus" data-m="${m}"><span>${MUS[m]}</span><span class="num">${count(m)}</span></button></li>`).join('')}</ul>
          <ul class="xl solo" role="list">${createRow()}</ul>${mockNote}`;
      }
      return `<section class="xb-sel" aria-label="${MUS[s.mus]}"><div class="xb-mini">${bodyMap(s.mus, [], true)}</div>
          <div class="od-stat"><span class="x-kick">Muscle</span><h2 class="display xb-name">${MUS[s.mus]}</h2>
          <span class="xb-n">${count(s.mus)} exercises</span>
          <button class="x-ghost sm" data-act="mus" data-m="">${ic('chevL')}All muscles</button></div></section>
        ${eqRail(f)}${results(f)}${mockNote}`;
    }

    // ── direction C · yours first ──
    function bodyC() {
      const f = filtered();
      if (s.q.trim()) return activeMus() + eqRail(f) + results(f, { split: true }) + mockNote;
      if (s.mus) {
        return `<div class="xy-back"><button class="x-ghost sm" data-act="mus" data-m="">${ic('chevL')}Exercises</button></div>
          <div class="xy-mh">${thumb(s.mus)}<div class="od-stat"><h2 class="display xb-name">${MUS[s.mus]}</h2><span class="xb-n">${f.res.length} exercises</span></div></div>
          ${eqRail(f)}${results(f, { split: true })}${mockNote}`;
      }
      let out = '';
      if (s.rout.length) {
        const r = s.rout.find((x) => x.k === s.plan) || s.rout[0];
        const list = r.ids.map(byId).filter(Boolean);
        out += `<section class="xg"><div class="xg-h"><h2 class="xg-t">In your plan</h2><span class="xg-r">Your best</span></div>
          <div class="xy-seg" role="tablist" aria-label="Routine">${s.rout.map((x) => `<button role="tab" class="xy-tab" style="--c:${rc(x.k)}" data-act="plan" data-v="${x.k}" aria-selected="${x.k === r.k}"><i aria-hidden="true"></i>${x.name}</button>`).join('')}</div>
          <ul class="xl" role="list" aria-label="${r.name}">${list.map(row).join('')}</ul></section>`;
      } else {
        out += `<section class="xg"><div class="xg-h"><h2 class="xg-t">In your plan</h2></div><div class="x-empty in-card"><p class="x-empty-t">Your routines' exercises will gather here.</p>
          <p class="x-empty-s">Open a muscle below and tap + on an exercise to put it in a routine. Your best weight shows up after your first set.</p></div></section>`;
      }
      const own = s.custom;
      out += `<section class="xg"><div class="xg-h"><h2 class="xg-t">Your own</h2>${hasBest(own) ? '<span class="xg-r">Your best</span>' : ''}</div><ul class="xl" role="list">${own.map(row).join('')}${createRow()}</ul></section>`;
      out += `<section class="xg"><div class="xg-h"><h2 class="xg-t">Browse by muscle</h2></div><ul class="xy-grid" role="list">${MUS_KEYS.map((m) => `<li><button class="xy-m" data-act="mus" data-m="${m}">${thumb(m)}<span class="od-stat"><span class="xy-mn">${MUS[m]}</span><span class="xy-mc">${count(m)} exercises</span></span></button></li>`).join('')}</ul></section>`;
      return out + mockNote;
    }

    const bodyFor = () => ({ search: bodyA, map: bodyB, yours: bodyC }[dir])();
    function header() {
      const f = filtered();
      if (dir === 'map') {
        if (s.searchOpen) return `<header class="x-hdr"><h1 class="display">Exercises</h1></header>${searchField(f, true)}`;
        return `<header class="x-hdr row"><div class="od-stat"><h1 class="display">Exercises</h1><p class="x-sub">${countLine()}</p></div>
          <button class="iconbtn x-sbtn" data-act="open-search" aria-label="Search exercises">${ic('search')}</button></header>`;
      }
      return `<header class="x-hdr"><h1 class="display">Exercises</h1><p class="x-sub">${countLine()}</p></header>${searchField(f, false)}`;
    }
    function draw(focusSel) {
      const sc = content.querySelector('.od-scroll'), top = sc ? sc.scrollTop : 0;
      content.innerHTML = `<div class="app v2 od-screen tabs-combo tabs-capsule ox ox-${dir}"><div class="od-scroll">${header()}<div data-body>${bodyFor()}</div></div>${OGv2.tabbarHTML('Exercises')}</div>`;
      content.querySelector('.od-scroll').scrollTop = top;
      revealChips();
      if (focusSel) content.querySelector(focusSel)?.focus({ preventScroll: true });
    }
    // typing redraws only the body, so the field keeps focus and the caret
    function drawBody() {
      const f = filtered(), body = content.querySelector('[data-body]');
      const rails = {}; body.querySelectorAll('[data-rail]').forEach((r) => { rails[r.dataset.rail] = r.scrollLeft; });
      body.innerHTML = bodyFor();
      body.querySelectorAll('[data-rail]').forEach((r) => { if (rails[r.dataset.rail] != null) r.scrollLeft = rails[r.dataset.rail]; });
      const n = content.querySelector('[data-count]'); if (n) n.textContent = showCount(f) ? f.res.length : '';
      const x = content.querySelector('.xs-x'); if (x) x.hidden = !s.q;
      content.querySelector('.xs')?.classList.toggle('has-q', !!s.q);
    }
    function revealChips() {
      content.querySelectorAll('[data-rail]').forEach((r) => { const on = r.querySelector('.xc.on'); if (on && on.offsetLeft > r.clientWidth - 40) r.scrollLeft = on.offsetLeft - 16; });
    }

    // ── layers (sheets and confirmations), stacked; Escape and the scrim close the top one ──
    const layers = [];
    function layer({ cls, html, label, onClick, focus, beforeClose, confirm }) {
      const trigger = document.activeElement;
      const scrim = document.createElement('div'); scrim.className = 'scrim' + (confirm ? ' x-cscrim' : '');
      const el = document.createElement('div');
      el.className = confirm ? 'x-confirm' : `sheet ox-sheet ${cls || ''}`;
      el.setAttribute('role', confirm ? 'alertdialog' : 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', label);
      el.innerHTML = html;
      host.append(scrim, el);
      const L = { el, refresh: (h) => { const y = el.querySelector('.ox-sc')?.scrollTop || 0; el.innerHTML = h; const sc2 = el.querySelector('.ox-sc'); if (sc2) sc2.scrollTop = y; } };
      L.close = (force) => {
        if (!force && beforeClose && beforeClose() === false) return;
        const i = layers.indexOf(L); if (i < 0) return; layers.splice(i, 1);
        scrim.classList.remove('in'); el.classList.remove('in');
        setTimeout(() => { scrim.remove(); el.remove(); }, 220);
        if (!force && trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
      };
      layers.push(L);
      requestAnimationFrame(() => requestAnimationFrame(() => { scrim.classList.add('in'); el.classList.add('in'); (el.querySelector(focus || 'button') || el).focus({ preventScroll: true }); }));
      scrim.addEventListener('click', () => L.close());
      el.addEventListener('click', (e) => { const b = e.target.closest('[data-x]'); if (b) onClick(b.dataset.x, b, L); });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.stopPropagation(); L.close(); }
        if (e.key === 'Tab') {
          const f = [...el.querySelectorAll('button:not([disabled]), input, [href]')].filter((n) => !n.closest('[hidden]'));
          if (!f.length) return;
          if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
      });
      return L;
    }
    function confirmBox({ title, msg, ok, cancel = 'Cancel', onOk }) {
      layer({ confirm: true, label: title, focus: '[data-x="no"]',
        html: `<h3>${esc(title)}</h3><p>${esc(msg)}</p><div class="x-cbtn"><button data-x="no">${cancel}</button><button class="danger" data-x="ok">${ok}</button></div>`,
        onClick: (x, b, L) => { L.close(true); if (x === 'ok') onOk(); } });
    }

    // ── exercise detail ──
    function spark(h) {
      const pts = h.ss.slice().reverse(), vs = pts.map((p) => p.v), lo = Math.min(...vs), hi = Math.max(...vs), span = hi - lo || 1;
      const W = 320, H = 72, px = (i) => 12 + i * ((W - 24) / Math.max(1, pts.length - 1)), py = (v) => 12 + (1 - (v - lo) / span) * (H - 24);
      const d = pts.map((p, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${py(p.v).toFixed(1)}`).join(' ');
      const bi = vs.lastIndexOf(hi);
      return `<svg class="xd-spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}"/>${pts.map((p, i) => `<circle cx="${px(i)}" cy="${py(p.v)}" r="${i === bi ? 5 : 3}" class="${i === bi ? 'pk' : ''}"/>`).join('')}</svg>
        <div class="xd-ax"><span>${pts[0].d}</span><span>${pts[pts.length - 1].d}</span></div>`;
    }
    const setsTxt = (h, x) => h.bw ? `${x.reps.join(', ')} reps` : `${kg(x.v)} kg × ${x.reps.join(', ')}`;
    function detailHTML(e, open) {
      const h = s.hist[e.id], fav = s.fav.has(e.id);
      const routines = s.rout.filter((r) => r.ids.includes(e.id));
      const helpers = e.sm.length ? ` · helps ${e.sm.map((m) => MUS[m]).join(', ')}` : '';
      const sessions = h ? (open ? h.ss : h.ss.slice(0, 3)) : [];
      const yours = h ? `<section class="xd-sec" aria-labelledby="xd-y"><h3 class="xd-h" id="xd-y">Your history</h3>
          <div class="xd-stats"><div class="od-stat"><span class="xd-sl">Best</span><span class="num xd-sv">${kg(h.best)}<small>${h.bw ? 'reps' : 'kg'}</small></span></div>
            <div class="od-stat"><span class="xd-sl">Sessions</span><span class="num xd-sv">${h.total}</span></div></div>
          <div class="xd-chart"><span class="xd-cl">${h.bw ? 'Top set, reps' : 'Working weight, kg'}</span>${spark(h)}</div>
          <ol class="xd-ss" role="list">${sessions.map((x) => `<li><span class="xd-sd">${x.d}</span><span class="xd-st">${setsTxt(h, x)}</span>${x.pr ? '<span class="xd-pr">PR</span>' : ''}</li>`).join('')}</ol>
          ${h.ss.length > 3 ? `<button class="x-ghost sm" data-x="more" aria-expanded="${!!open}">${open ? 'Show fewer' : 'Show more'}</button>` : ''}
          ${h.total > h.ss.length && open ? `<button class="x-ghost" data-x="progress">All ${h.total} sessions in Progress${ic('chevR')}</button>` : ''}</section>`
        : `<section class="xd-sec xd-never" aria-labelledby="xd-y"><h3 class="xd-h" id="xd-y">Your history</h3>
          <p class="xd-nt">You haven't done this one yet.</p><p class="xd-ns">Add it to a routine. Your best and every session will show up here after your first set.</p></section>`;
      return `<span class="grab" aria-hidden="true"></span>
        <div class="xd-bar"><span class="x-kick">${e.custom ? 'Your own exercise' : 'Exercise'}</span>
          <button class="xd-ib${fav ? ' on' : ''}" data-x="fav" aria-pressed="${fav}" aria-label="${fav ? 'Remove from favourites' : 'Add to favourites'}">${ic('star', fav)}</button>
          <button class="xd-ib" data-x="close" aria-label="Close">${ui('x')}</button></div>
        <div class="ox-sc">
          <div class="xd-hero">${e.custom ? `<div class="xd-nomedia"><span class="xd-ai">${ic('camera')}</span><span>No photo or video yet</span></div>` : OGAnim.figure(e.n)}</div>
          <h2 class="display xd-name" id="xd-name">${esc(e.n)}</h2>
          <p class="xd-mus"><b>${MUS[e.m]}</b>${helpers}${e.eq ? ` · ${esc(e.eq)}` : ''}</p>
          ${routines.length ? `<p class="xd-in">${routines.map((r) => `<span style="--c:${rc(r.k)}"><i aria-hidden="true"></i>In ${r.name}</span>`).join('')}</p>` : ''}
          <div class="xd-bmrow"><div class="xd-bm">${bodyMap(e.m, e.sm)}</div>
            <div class="xd-lg"><span><i class="lit"></i>Main muscle</span>${e.sm.length ? '<span><i class="half"></i>Helps</span>' : ''}</div></div>
          ${e.d || e.s.length ? `<section class="xd-sec" aria-labelledby="xd-a"><h3 class="xd-h" id="xd-a">${e.s.length ? 'How to' : 'Your note'}</h3>${e.d ? `<p class="xd-d">${esc(e.d)}</p>` : ''}
            ${e.s.length ? `<ol class="xd-steps">${e.s.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>` : ''}</section>` : ''}
          ${yours}
          ${e.custom ? `<div class="xd-own"><button class="x-ghost" data-x="edit">${ic('pencil')}Edit</button><button class="x-ghost danger" data-x="delete">${ic('trash')}Delete</button></div>`
            : '<p class="xd-fix"><button class="x-link" data-x="fix">Suggest a fix for this exercise</button></p>'}
        </div>
        <div class="xd-foot"><button class="x-solid" data-x="add">${ui('plus')}Add to a routine</button></div>`;
    }
    function openDetail(id) {
      const e = byId(id); if (!e) return;
      let open = false;
      const L = layer({ cls: 'ox-detail', label: e.n, html: detailHTML(e, open), focus: '[data-x="close"]',
        onClick: (x, b, L) => {
          if (x === 'close') L.close();
          else if (x === 'more') { open = !open; L.refresh(detailHTML(e, open)); L.el.querySelector('[data-x="more"]')?.focus(); }
          else if (x === 'fav') {
            const on = !s.fav.has(e.id); on ? s.fav.add(e.id) : s.fav.delete(e.id);
            L.refresh(detailHTML(e, open)); L.el.querySelector('[data-x="fav"]').focus(); drawBody();
            toast(on ? 'Added to favourites' : 'Removed from favourites');
          }
          else if (x === 'add') openAdd(e.id);
          else if (x === 'progress') toast(`Opens ${e.n} in Progress, with all ${s.hist[e.id].total} sessions.`);
          else if (x === 'fix') toast('Opens a ready-made report for this exercise, as the app does today.');
          else if (x === 'edit') openCreate(e, '', () => { L.refresh(detailHTML(e, open)); L.el.querySelector('[data-x="edit"]')?.focus(); });
          else if (x === 'delete') confirmBox({ title: `Delete “${e.n}”?`, msg: 'It will be removed from your routines. Workouts you already logged keep their sets.', ok: 'Delete',
            onOk: () => { s.custom = s.custom.filter((c) => c.id !== e.id); s.rout.forEach((r) => { r.ids = r.ids.filter((i) => i !== e.id); }); s.fav.delete(e.id); L.close(true); draw(); toast('Exercise deleted'); } });
        } });
      return L;
    }

    // ── add to a routine ──
    function openAdd(id) {
      const e = byId(id); if (!e) return;
      const html = `<span class="grab" aria-hidden="true"></span>
        <div class="xd-bar"><span class="x-kick">Add to a routine</span><button class="xd-ib" data-x="close" aria-label="Close">${ui('x')}</button></div>
        <h2 class="display xa-name od-clamp-2">${esc(e.n)}</h2>
        <p class="xa-s">Pick a routine. You set its sets and weight in Plan.</p>
        <ul class="xl" role="list">${s.rout.map((r) => { const inR = r.ids.includes(e.id); return `<li class="xr"><button class="xr-main${inR ? ' is-in' : ''}" data-x="${inR ? 'already' : 'pick'}" data-r="${r.k}"${inR ? ` aria-disabled="true" aria-label="${r.name}, already has this exercise"` : ''}>
            <span class="xa-dot" style="--c:${rc(r.k)}" aria-hidden="true"></span><span class="xr-tx"><span class="xr-n">${r.name}</span><span class="xr-s">${r.ids.length} exercises</span></span>
            ${inR ? `<span class="xa-in">${ui('check')}Already in</span>` : `<span class="xa-plus" aria-hidden="true">${ui('plus')}</span>`}</button></li>`; }).join('')}
          ${s.rout.some((r) => r.k === 'new') ? '' : `<li class="xr"><button class="xr-main" data-x="pick" data-r="new"><span class="xa-dot new" aria-hidden="true">${ui('plus')}</span>
            <span class="xr-tx"><span class="xr-n">New routine</span><span class="xr-s">Start one with this exercise</span></span></button></li>`}</ul>`;
      layer({ cls: 'ox-add', label: `Add ${e.n} to a routine`, html, focus: '[data-x="pick"]',
        onClick: (x, b, L) => {
          if (x === 'close') return L.close();
          const r0 = s.rout.find((k) => k.k === b.dataset.r);
          if (x === 'already') return toast(`Already in ${r0.name}`);
          if (x !== 'pick') return;
          let r = r0;
          if (!r) { r = { k: 'new', name: 'New routine', ids: [] }; s.rout.push(r); }   // one draft routine, reused
          r.ids.push(e.id);
          layers.slice().forEach((l) => l.close(true));
          draw();
          toast(`Added to ${r.name}. Set its sets and weight in Plan.`);
        } });
    }

    // ── create / edit your own ──
    function openCreate(existing, prefill = '', onSaved) {
      const init = existing ? { n: existing.n, m: existing.m, eq: existing.eq || '' } : { n: prefill, m: '', eq: '' };
      const v = { ...init };
      const EQS = ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Body weight', 'Kettlebell', 'Landmine', 'Band'];
      const dirty = () => v.n.trim() !== init.n.trim() || v.m !== init.m || v.eq !== init.eq;
      const ok = () => v.n.trim() && v.m;
      const html = () => `<span class="grab" aria-hidden="true"></span>
        <div class="xd-bar"><span class="x-kick">${existing ? 'Edit your exercise' : 'New exercise'}</span><button class="xd-ib" data-x="close" aria-label="Close">${ui('x')}</button></div>
        <div class="ox-sc xf">
          <label class="xf-l" for="xf-n">Name</label>
          <input id="xf-n" class="xf-in" data-in="name" value="${esc(v.n)}" placeholder="For example, Sissy squat" autocomplete="off" />
          <span class="xf-l" id="xf-ml">Main muscle</span>
          <div class="xf-chips" role="group" aria-labelledby="xf-ml">${MUS_KEYS.map((m) => `<button class="xc${v.m === m ? ' on' : ''}" data-x="m" data-v="${m}" aria-pressed="${v.m === m}">${MUS[m]}</button>`).join('')}</div>
          <span class="xf-l" id="xf-el">Equipment <small>optional</small></span>
          <div class="xf-chips" role="group" aria-labelledby="xf-el">${EQS.map((q) => `<button class="xc${v.eq === q ? ' on' : ''}" data-x="eq" data-v="${q}" aria-pressed="${v.eq === q}">${q}</button>`).join('')}</div>
          <span class="xf-l">Photo or video <small>optional</small></span>
          <button class="x-ghost" data-x="media">${ic('camera')}Add a photo or video</button>
        </div>
        <div class="xd-foot"><p class="xf-st" role="status">${ok() ? (dirty() ? 'Not saved yet' : '') : 'Add a name and pick a muscle to save.'}</p>
          <button class="x-solid" data-x="save" ${ok() ? '' : 'disabled'}>${existing ? 'Save changes' : 'Save exercise'}</button></div>`;
      let L;
      const refresh = (focusSel) => { L.refresh(html()); if (focusSel) L.el.querySelector(focusSel)?.focus(); };
      L = layer({ cls: 'ox-create', label: existing ? 'Edit your exercise' : 'New exercise', html: html(), focus: '#xf-n',
        beforeClose: () => {
          if (!dirty()) return true;
          confirmBox({ title: existing ? 'Discard your changes?' : 'Discard this exercise?', msg: 'What you entered here will be lost.', ok: 'Discard', cancel: 'Keep editing', onOk: () => L.close(true) });
          return false;
        },
        onClick: (x, b) => {
          if (x === 'close') L.close();
          else if (x === 'm') { v.m = v.m === b.dataset.v ? '' : b.dataset.v; refresh(`[data-x="m"][data-v="${b.dataset.v}"]`); }
          else if (x === 'eq') { v.eq = v.eq === b.dataset.v ? '' : b.dataset.v; refresh(`[data-x="eq"][data-v="${b.dataset.v}"]`); }
          else if (x === 'media') toast('Opens your photo library, as the app does today.');
          else if (x === 'save' && ok()) {
            const data = { n: v.n.trim(), m: v.m, eq: v.eq };
            let id;
            if (existing) { Object.assign(existing, data); id = existing.id; }
            else { id = 'c' + Date.now(); s.custom.unshift({ id, ...data, sm: [], al: [], custom: true, d: '', s: [] }); }
            L.close(true); if (!existing) s.q = ''; draw(); toast(existing ? 'Changes saved' : 'Created. It works like any other exercise.');
            if (existing && onSaved) onSaved(); else openDetail(id);
          }
        } });
      L.el.addEventListener('input', (e) => {
        if (e.target.dataset.in !== 'name') return;
        v.n = e.target.value;
        const st = L.el.querySelector('.xf-st'), sv = L.el.querySelector('[data-x="save"]');
        st.textContent = ok() ? (dirty() ? 'Not saved yet' : '') : 'Add a name and pick a muscle to save.';
        sv.disabled = !ok();
      });
    }

    // ── screen events ──
    content.addEventListener('input', (e) => {
      if (e.target.dataset.in !== 'q') return;
      s.q = e.target.value; drawBody();
    });
    content.addEventListener('keydown', (e) => { if (e.key === 'Escape' && e.target.dataset.in === 'q' && s.q) { s.q = ''; e.target.value = ''; drawBody(); } });
    content.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b || layers.length) return;
      const act = b.dataset.act;
      if (act === 'open') openDetail(b.dataset.id);
      else if (act === 'add') openAdd(b.dataset.id);
      else if (act === 'create') openCreate(null, s.q.trim() ? s.q.trim().replace(/^./, (c) => c.toUpperCase()) : '');
      else if (act === 'mus') {
        const m = b.dataset.m ?? b.dataset.v;
        s.mus = m === s.mus && dir !== 'yours' && b.tagName !== 'BUTTON' ? '' : m; s.eq = '';
        content.querySelector('.od-scroll').scrollTop = 0;
        draw(dir === 'search' ? `.xc[data-act="mus"][data-v="${s.mus}"]` : s.mus ? '.xb-sel .x-ghost, .xy-back .x-ghost' : `[data-act="mus"][data-m="${m}"]`);
      }
      else if (act === 'unmus') { s.mus = ''; s.eq = ''; draw('[data-in="q"]'); }
      else if (act === 'eq') { s.eq = b.dataset.v; drawBody(); content.querySelector(`.xc[data-act="eq"][data-v="${CSS.escape(s.eq)}"]`)?.focus({ preventScroll: true }); }
      else if (act === 'plan') { s.plan = b.dataset.v; drawBody(); content.querySelector(`[data-act="plan"][data-v="${s.plan}"]`)?.focus({ preventScroll: true }); }
      else if (act === 'clear') { s.q = ''; drawBody(); content.querySelector('[data-in="q"]').value = ''; content.querySelector('[data-in="q"]').focus(); }
      else if (act === 'widen') { s.mus = ''; s.eq = ''; draw('[data-in="q"]'); }
      else if (act === 'open-search') { s.searchOpen = true; draw('[data-in="q"]'); }
      else if (act === 'cancel-search') { s.searchOpen = false; s.q = ''; s.eq = ''; draw('[data-act="open-search"]'); }
      else if (act === 'tab') toast(`${b.dataset.tab} has its own board.`);
      else if (act === 'start' || act === 'resume') toast('Starting a workout is on the Home and workout boards.');
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && layers.length && !layers[layers.length - 1].el.contains(e.target)) layers[layers.length - 1].close(); });
    window.addEventListener('message', (e) => { if (e.data && typeof e.data.ogState === 'string' && STATES[e.data.ogState]) reset(e.data.ogState); });
    reset(STATES[state] ? state : 'browse');
    if (open) { const ex = all().find((x) => x.id === open || x.n.toLowerCase() === String(open).toLowerCase()); if (ex) openDetail(ex.id); }
  }
  return { mount, STATES };
})();
