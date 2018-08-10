public class PipelineDemo {
    public static void main() {
        Integer val = (Integer)((Func)R.add.apply(1)).run(((Func)R.inc).run(1));

        val = (Integer)((Func)R.inc).run(2);
    }
}