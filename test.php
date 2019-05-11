<?php
function getLatorLngFromDM($dm, $nsORew){
	//Latitude in format „ddmm.mmmm‟ (degrees and minutes)
	//Longitude in format „dddmm.mmmm‟ (degrees and minutes)

	$brk = strpos($dm, ".") - 2;
	if($brk < 0){ $brk = 0; }
	$minutes = substr($dm, $brk);
	$degrees = substr($dm, 0, $brk);

	$newPos = $degrees + $minutes/60;
	if($nsORew == "W" || $nsORew == "S"){
		$newPos = -1 * $newPos;
	}
	return $newPos;
}

$ll = "1042.7500";
$llN = "N";
$lng = "10635.7464";
$lngE = "E";
echo "\n\n";
echo "lat = " . getLatorLngFromDM($ll, $llN);
echo "\n";
echo "lng = " . getLatorLngFromDM($lng, $lngE);
echo "\n\n";
?>
