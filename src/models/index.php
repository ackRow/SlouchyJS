<?php
/*
 *  Copyright(C) 2018 Hugo Rosenkranz
 *
 *  This Source Code Form is subject to the terms of the
 *  Mozilla Public License, v. 2.0. If a copy of the MPL
 *  was not distributed with this file, You can obtain one at
 *  http://mozilla.org/MPL/2.0/.
 */

/*
 *  Store steem account trained model
 */

  $content_dir = "./".$_SERVER['HTTP_USER']."/";
  if(!file_exists($content_dir))
    mkdir($content_dir, 0777, true);

  $model_json = $_FILES['model_json'];
  $weights = $_FILES['model_weights_bin'];


  if( !is_uploaded_file($model_json['tmp_name']) || !is_uploaded_file($weights['tmp_name']))
  {
      $output["success"] = -1;
      rmdir($content_dir);
  }
  else if( !move_uploaded_file($model_json['tmp_name'], $content_dir . $model_json['name']) ||
  				 !move_uploaded_file($weights['tmp_name'], $content_dir . $weights['name']))
  {
      $output["success"] = 0;
      rmdir($content_dir);
  }else{
  	$output["success"] = 1;
  }

  echo json_encode($output);
	           
?>