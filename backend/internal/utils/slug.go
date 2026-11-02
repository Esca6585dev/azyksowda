package utils

import (
	"regexp"
	"strings"
)

var translit = map[rune]string{
	'ä': "a", 'Ä': "a", 'ž': "zh", 'Ž': "zh", 'ň': "n", 'Ň': "n",
	'ö': "o", 'Ö': "o", 'ş': "sh", 'Ş': "sh", 'ü': "u", 'Ü': "u",
	'ý': "y", 'Ý': "y", 'ç': "ch", 'Ç': "ch",
	// cyrillic (common in local product names)
	'а': "a", 'б': "b", 'в': "v", 'г': "g", 'д': "d", 'е': "e", 'ё': "yo", 'ж': "zh",
	'з': "z", 'и': "i", 'й': "y", 'к': "k", 'л': "l", 'м': "m", 'н': "n", 'о': "o",
	'п': "p", 'р': "r", 'с': "s", 'т': "t", 'у': "u", 'ф': "f", 'х': "h", 'ц': "ts",
	'ч': "ch", 'ш': "sh", 'щ': "sch", 'ъ': "", 'ы': "y", 'ь': "", 'э': "e", 'ю': "yu", 'я': "ya",
}

var nonAlnum = regexp.MustCompile(`[^a-z0-9]+`)
var dashes = regexp.MustCompile(`-+`)

// Slugify converts a Turkmen/Cyrillic/Latin string to a URL-safe slug.
func Slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	var b strings.Builder
	for _, r := range s {
		if t, ok := translit[r]; ok {
			b.WriteString(t)
		} else {
			b.WriteRune(r)
		}
	}
	out := nonAlnum.ReplaceAllString(b.String(), "-")
	out = dashes.ReplaceAllString(out, "-")
	out = strings.Trim(out, "-")
	if out == "" {
		out = "item"
	}
	return out
}
