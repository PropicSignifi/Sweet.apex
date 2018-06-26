public class TemplateString {
    public static String a = 'a';
    public static String b = 'b';
    public static String c = `${a}-${b}`;
    public static String text = `
        This is a free style text.
        You can add ${c} here.
        Try it.
        `;
}
