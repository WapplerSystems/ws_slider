#
# Table structure for table 'tx_wsslider_domain_model_item'
#
CREATE TABLE tx_wsslider_domain_model_item
(

	content_uid      int(11) unsigned DEFAULT '0' NOT NULL,

	title            varchar(255)     DEFAULT ''  NOT NULL,
	description      text                         NOT NULL,
	foreground_media int(11) unsigned DEFAULT '0',
	background_media int(11) unsigned DEFAULT '0',
	link             text,
	text_position    varchar(10)      DEFAULT NULL,
	style_class      varchar(10)      DEFAULT NULL

);

CREATE TABLE tt_content
(
	tx_wsslider_preset   int(11)     DEFAULT '0' NOT NULL,
	tx_wsslider_items    int(11)     DEFAULT '0' NOT NULL,
	tx_wsslider_renderer varchar(40) DEFAULT NULL,
	tx_wsslider_layout   varchar(40) DEFAULT NULL
);

CREATE TABLE tx_wsslider_domain_model_preset
(

	name       varchar(255)         DEFAULT '' NOT NULL,
	type       varchar(20) NOT NULL DEFAULT '',

	flexslider text                 DEFAULT NULL,
	bootstrap  text                 DEFAULT NULL,
	owl        text                 DEFAULT NULL,
	slick      text                 DEFAULT NULL,
	tinyslider text                 DEFAULT NULL

);
